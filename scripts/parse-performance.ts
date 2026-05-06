/**
 * APRA Performance Statistics parser
 *
 * Reads the APRA Quarterly Private Health Insurance Performance Statistics
 * xlsx file, extracts the metrics we need, computes derived values
 * (loss ratio, net margin, TTM rollups, YoY deltas), and writes a clean
 * JSON file the dashboard consumes.
 *
 * Run from project root:
 *   npx tsx scripts/parse-performance.ts
 *
 * Input:  data/raw/performance.xlsx
 * Output: public/data/financial.json
 */

import ExcelJS from "exceljs"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

// --- Config ---

const INPUT_PATH = join(
  process.cwd(),
  "data/raw/performance.xlsx"
)
const OUTPUT_PATH = join(process.cwd(), "public/data/financial.json")

// Map APRA's verbose data item names to our short field names.
// Add to this when you need more metrics.
const ITEM_MAP: Record<string, string> = {
  "Insurance revenue": "insuranceRevenue",
  "Insurance service expense - Incurred claims": "incurredClaims",
  "Insurance service expense": "insuranceServiceExpense",
  "Insurance service result": "insuranceServiceResult",
  "Investment result": "investmentResult",
  "Profit (loss) from continuing operations after income tax": "netProfit",
  "Profit (loss) from continuing operations before tax": "preTaxProfit",
  "General treatment premium revenue": "generalTreatmentRevenue",
  "General treatment claims incurred": "generalTreatmentClaims",
  "Net expense from reinsurance contracts held": "netReinsurance",
  "Capital Base": "capitalBase",
}

// APRA records expenses as negative numbers (accounting convention).
// We absolute-value these so loss ratios calculate cleanly.
const EXPENSE_FIELDS = new Set([
  "incurredClaims",
  "insuranceServiceExpense",
  "generalTreatmentClaims",
  "netReinsurance",
])

// --- Types ---

type Period = {
  periodEnd: string // ISO date
  periodLabel: string // e.g. "Dec 2025"
  quarter: string // e.g. "Q4 FY2026"
  insuranceRevenue?: number
  incurredClaims?: number
  insuranceServiceExpense?: number
  insuranceServiceResult?: number
  investmentResult?: number
  netProfit?: number
  preTaxProfit?: number
  generalTreatmentRevenue?: number
  generalTreatmentClaims?: number
  netReinsurance?: number
  capitalBase?: number
  // Computed
  lossRatio?: number
  netMargin?: number
  underwritingMargin?: number
  // TTM (trailing twelve months) — added in second pass
  ttmRevenue?: number
  ttmClaims?: number
  ttmNetProfit?: number
  ttmLossRatio?: number
  ttmNetMargin?: number
  // YoY deltas — added in third pass
  revenueYoY?: number
  netProfitYoY?: number
}

type FinancialJson = {
  meta: {
    source: string
    sourceUrl: string
    license: string
    lastUpdated: string
    periodCount: number
  }
  periods: Period[]
}

// --- Helpers ---

function quarterLabel(date: Date): string {
  const m = date.getMonth() + 1
  const y = date.getFullYear()
  // Australian fiscal year: July–June. FY26 = Jul 2025 to Jun 2026.
  const fy = m <= 6 ? y : y + 1
  // Quarter within FY: Jul–Sep = Q1, Oct–Dec = Q2, Jan–Mar = Q3, Apr–Jun = Q4
  const fyQuarter =
    m >= 7 && m <= 9 ? 1 :
    m >= 10 && m <= 12 ? 2 :
    m >= 1 && m <= 3 ? 3 : 4
  return `Q${fyQuarter} FY${fy}`
}

function periodLabel(date: Date): string {
  return date.toLocaleString("en-AU", { month: "short", year: "numeric" })
}

// --- Main ---

async function main() {
  console.log(`Reading ${INPUT_PATH}...`)

  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(INPUT_PATH)
  const sheet = wb.getWorksheet("Database")
  if (!sheet) throw new Error("Database sheet not found")

  // Group rows by period
  const byPeriod = new Map<string, Period>()

  sheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
    if (rowNum === 1) return // header

    const periodEnd = row.getCell(1).value
    const dataItem = row.getCell(2).value as string
    const value = row.getCell(6).value

    // Skip non-numeric values (APRA uses '*' for suppressed data)
    if (typeof value !== "number") return
    if (!(periodEnd instanceof Date)) return

    const fieldName = ITEM_MAP[dataItem]
    if (!fieldName) return // not a metric we need

    const key = periodEnd.toISOString().slice(0, 10)
    if (!byPeriod.has(key)) {
      byPeriod.set(key, {
        periodEnd: key,
        periodLabel: periodLabel(periodEnd),
        quarter: quarterLabel(periodEnd),
      })
    }

    const record = byPeriod.get(key)!
    const finalValue = EXPENSE_FIELDS.has(fieldName)
      ? Math.abs(value)
      : value
    ;(record as Record<string, unknown>)[fieldName] = Math.round(finalValue)
  })

  // Sort periods chronologically
  const periods = Array.from(byPeriod.values()).sort((a, b) =>
    a.periodEnd.localeCompare(b.periodEnd)
  )

  // Pass 2: computed ratios per period
  for (const p of periods) {
    if (p.insuranceRevenue && p.incurredClaims) {
      p.lossRatio = round(p.incurredClaims / p.insuranceRevenue, 4)
    }
    if (p.insuranceRevenue && p.netProfit !== undefined) {
      p.netMargin = round(p.netProfit / p.insuranceRevenue, 4)
    }
    if (p.insuranceRevenue && p.insuranceServiceResult !== undefined) {
      p.underwritingMargin = round(
        p.insuranceServiceResult / p.insuranceRevenue,
        4
      )
    }
  }

  // Pass 3: TTM (trailing twelve months) rolling sums
  for (let i = 3; i < periods.length; i++) {
    const window = periods.slice(i - 3, i + 1)
    const sumRev = sumOf(window, "insuranceRevenue")
    const sumClaims = sumOf(window, "incurredClaims")
    const sumProfit = sumOf(window, "netProfit")
    const p = periods[i]
    if (sumRev !== null) {
      p.ttmRevenue = sumRev
      if (sumClaims !== null) p.ttmLossRatio = round(sumClaims / sumRev, 4)
      if (sumProfit !== null) p.ttmNetMargin = round(sumProfit / sumRev, 4)
    }
    if (sumClaims !== null) p.ttmClaims = sumClaims
    if (sumProfit !== null) p.ttmNetProfit = sumProfit
  }

  // Pass 4: YoY deltas (vs same quarter prior year, i.e. -4 quarters)
  for (let i = 4; i < periods.length; i++) {
    const p = periods[i]
    const prior = periods[i - 4]
    if (p.insuranceRevenue && prior.insuranceRevenue) {
      p.revenueYoY = round(
        (p.insuranceRevenue - prior.insuranceRevenue) / prior.insuranceRevenue,
        4
      )
    }
    if (p.netProfit !== undefined && prior.netProfit) {
      p.netProfitYoY = round(
        (p.netProfit - prior.netProfit) / prior.netProfit,
        4
      )
    }
  }

  // Write output
  const out: FinancialJson = {
    meta: {
      source:
        "APRA Quarterly Private Health Insurance Performance Statistics",
      sourceUrl:
        "https://www.apra.gov.au/quarterly-private-health-insurance-performance-statistics",
      license: "CC BY 3.0 AU",
      lastUpdated: new Date().toISOString(),
      periodCount: periods.length,
    },
    periods,
  }

  await mkdir(join(process.cwd(), "public/data"), { recursive: true })
  await writeFile(OUTPUT_PATH, JSON.stringify(out, null, 2))

  console.log(`✓ Wrote ${OUTPUT_PATH}`)
  console.log(`  ${periods.length} periods, latest: ${periods.at(-1)?.periodLabel}`)
}

function sumOf(records: Period[], key: keyof Period): number | null {
  let total = 0
  let count = 0
  for (const r of records) {
    const v = r[key]
    if (typeof v === "number") {
      total += v
      count++
    }
  }
  return count === records.length ? total : null
}

function round(n: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(n * factor) / factor
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
