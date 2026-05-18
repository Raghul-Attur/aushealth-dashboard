import { NextRequest } from "next/server"
import { getFinancialData, getRecentPeriods, getCoverageData, getOperationalData } from "@/lib/data/loaders"
import { fmt } from "@/lib/format"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const { query } = await req.json()
  if (!query?.trim()) return Response.json({ error: "No query" }, { status: 400 })

  const [financial, recent, coverage, operational] = await Promise.all([
    getFinancialData(),
    getRecentPeriods(8),
    getCoverageData(),
    getOperationalData(),
  ])

  const latest = recent.at(-1)!
  const prior = recent.at(-2)

  const dataSummary = `
AUSHEALTH DASHBOARD DATA — Q2 FY2026 (Dec 2025)

FINANCIAL:
- Insurance revenue (TTM): ${fmt.currency(latest.ttmRevenue ?? 0)}
- Insurance revenue (quarterly): ${fmt.currency(latest.insuranceRevenue ?? 0)}
- Incurred claims: ${fmt.currency(latest.incurredClaims ?? 0)}
- Loss ratio: ${((latest.lossRatio ?? 0) * 100).toFixed(2)}% (prior: ${((prior?.lossRatio ?? 0) * 100).toFixed(2)}%)
- Net margin: ${((latest.netMargin ?? 0) * 100).toFixed(2)}% (prior: ${((prior?.netMargin ?? 0) * 100).toFixed(2)}%)
- Net profit (quarterly): ${fmt.currency(latest.netProfit ?? 0)}
- Net profit (TTM): ${fmt.currency(latest.ttmNetProfit ?? 0)}
- Investment result: ${fmt.currency(latest.investmentResult ?? 0)}
- Capital base: ${fmt.currency(latest.capitalBase ?? 0)}
- Revenue YoY: ${((latest.revenueYoY ?? 0) * 100).toFixed(1)}%
- Net profit YoY: ${((latest.netProfitYoY ?? 0) * 100).toFixed(1)}%

8-QUARTER TREND (newest first):
${recent.slice().reverse().map(p => `  ${p.periodLabel}: revenue ${fmt.currency(p.insuranceRevenue ?? 0)}, loss ratio ${((p.lossRatio ?? 0) * 100).toFixed(1)}%, margin ${((p.netMargin ?? 0) * 100).toFixed(1)}%`).join('\n')}

CUSTOMER / COVERAGE:
- HT insured: ${fmt.number(coverage.periods.at(-1)?.htInsured ?? 0)}
- HT coverage: ${((coverage.periods.at(-1)?.htCoverage ?? 0) * 100).toFixed(1)}%
- GT insured: ${fmt.number(coverage.periods.at(-1)?.gtInsured ?? 0)}
- Population: ${fmt.number(coverage.periods.at(-1)?.population ?? 0)}
- Top state: ${[...coverage.states].sort((a,b) => b.htCoverage - a.htCoverage)[0]?.state} (${(([...coverage.states].sort((a,b) => b.htCoverage - a.htCoverage)[0]?.htCoverage ?? 0) * 100).toFixed(1)}%)
- Lowest state: ${[...coverage.states].sort((a,b) => a.htCoverage - b.htCoverage)[0]?.state} (${(([...coverage.states].sort((a,b) => a.htCoverage - b.htCoverage)[0]?.htCoverage ?? 0) * 100).toFixed(1)}%)

OPERATIONAL:
- Fund benefits paid: ${fmt.currency(operational.periods.at(-1)?.totalBenefits ?? 0)}
- Total services: ${fmt.number(operational.gap.totalServices)}
- Patient gap %: ${(operational.gap.gapPct * 100).toFixed(1)}%
- Avg benefit per service: ${fmt.currency(operational.gap.avgBenefitPerService)}
- Largest specialty: ${operational.specialties[0]?.specialty} (${fmt.currency(operational.specialties[0]?.benefitsPaid ?? 0)})
- Fastest growing: ${[...operational.specialties].sort((a,b) => b.yoyChange - a.yoyChange)[0]?.specialty} (+${(([...operational.specialties].sort((a,b) => b.yoyChange - a.yoyChange)[0]?.yoyChange ?? 0) * 100).toFixed(1)}% YoY)
`

  const systemPrompt = `You are an AI assistant embedded in AusHealth, an executive dashboard for Australian private health insurance industry data. Answer executive queries by surfacing the most relevant metrics in a structured bento-grid format.

Respond with a JSON object containing:
- summary: 1-2 sentence plain English answer (max 60 words)
- metrics: array of 3-6 metric objects each with:
  - id: unique string
  - label: short metric name (max 4 words)
  - value: formatted value string
  - delta: optional delta e.g. "+4.8% YoY"
  - trend: "up" | "down" | "flat"
  - inverse: boolean (true if up is bad e.g. loss ratio)
  - subtext: optional 1 sentence context (max 12 words)
  - size: "hero" for the single most important metric, "standard" for others
  - category: "financial" | "customer" | "operational"
- insight: 1-2 sentence analytical insight (max 50 words)
- recommended_actions: array of 2-3 short actionable strings

Rules: always exactly ONE hero metric. Values must come from the provided data. Respond ONLY with valid JSON, no markdown, no backticks, no preamble.`

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 })
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: `Dashboard data:\n${dataSummary}\n\nExecutive query: "${query}"\n\nRespond with JSON only.`,
      }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    console.error("Anthropic error:", response.status, err)
    return Response.json({ error: "AI service unavailable" }, { status: 502 })
  }

  const data = await response.json()
  const text = data.content?.[0]?.text ?? ""

  try {
    const clean = text.replace(/```json|```/g, "").trim()
    return Response.json(JSON.parse(clean))
  } catch {
    console.error("Parse error:", text)
    return Response.json({ error: "Failed to parse response" }, { status: 500 })
  }
}