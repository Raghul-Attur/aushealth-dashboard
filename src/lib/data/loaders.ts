/**
 * Server-side data loader.
 *
 * Reads parsed APRA JSON from public/data/ and validates it against
 * the Zod schemas. Cached per request via React's `cache()`.
 *
 * This is server-only — never imported from a client component.
 */

import "server-only"

import { readFile } from "fs/promises"
import { join } from "path"
import { cache } from "react"
import { financialJsonSchema, type FinancialJson, type Period } from "./schemas"

import { coverageJsonSchema, type CoverageJson } from "./schemas"

export const getCoverageData = cache(async (): Promise<CoverageJson> => {
  const raw = await readFile(join(DATA_DIR, "coverage.json"), "utf-8")
  return coverageJsonSchema.parse(JSON.parse(raw))
})

const DATA_DIR = join(process.cwd(), "public/data")

export const getFinancialData = cache(async (): Promise<FinancialJson> => {
  const raw = await readFile(join(DATA_DIR, "financial.json"), "utf-8")
  const parsed = JSON.parse(raw)
  return financialJsonSchema.parse(parsed)
})

/**
 * Convenience: get the most recent period's data.
 */
export async function getLatestPeriod(): Promise<Period> {
  const data = await getFinancialData()
  const last = data.periods.at(-1)
  if (!last) throw new Error("No periods in financial data")
  return last
}

/**
 * Convenience: get the period preceding the latest, for delta calcs.
 */
export async function getPriorPeriod(): Promise<Period | null> {
  const data = await getFinancialData()
  return data.periods.at(-2) ?? null
}

/**
 * Convenience: get the last N periods (default 8) for trend charts.
 */
export async function getRecentPeriods(n = 8): Promise<Period[]> {
  const data = await getFinancialData()
  return data.periods.slice(-n)
}
