import { KpiHero } from "@/components/kpi/kpi-hero"
import { KpiTile } from "@/components/kpi/kpi-tile"
import { KpiStrip } from "@/components/kpi/kpi-strip"
import { Card } from "@/components/layout/card"
import { SectionHeader } from "@/components/layout/section-header"
import { WatchListCard } from "@/components/layout/watch-list-card"
import { BulletChart } from "@/components/charts/bullet-chart"
import { WaterfallChart } from "@/components/charts/waterfall"
import { ProfitCompositionChart } from "@/components/charts/profit-composition"
import {
  getFinancialData,
  getRecentPeriods,
} from "@/lib/data/loaders"
import {
  buildBulletData,
  buildProfitComposition,
  buildRevenueWaterfall,
} from "@/lib/data/transforms"
import { generateHeadline } from "@/lib/insights"
import { fmt } from "@/lib/format"
import type { Period } from "@/lib/data/schemas"

function generateFinancialHeadline(latest: Period, prior: Period | null) {
  const margin = latest.netMargin ?? 0
  const lossRatio = latest.lossRatio ?? 0
  const investmentShare =
    latest.investmentResult && latest.netProfit
      ? Math.round((latest.investmentResult / latest.netProfit) * 100)
      : 0

  const sentence =
    investmentShare > 30
      ? `Q4 net profit of ${fmt.currency(latest.netProfit ?? 0)} reflects ${fmt.percent(margin)} margin on ${fmt.currency(latest.insuranceRevenue ?? 0)} revenue, with investment income contributing ~${investmentShare}% of bottom-line earnings.`
      : `Q4 net profit of ${fmt.currency(latest.netProfit ?? 0)} reflects ${fmt.percent(margin)} margin on ${fmt.currency(latest.insuranceRevenue ?? 0)} revenue, driven primarily by underwriting result.`

  let status: "healthy" | "watch" | "action" = "healthy"
  if (margin < 0.04 || lossRatio > 0.88) status = "action"
  else if (margin < 0.06 || lossRatio > 0.85) status = "watch"

  return {
    status,
    statusLabel: status === "healthy" ? "Healthy" : status === "watch" ? "Watch" : "Action",
    sentence,
    period: latest.periodLabel,
  }
}

export default async function FinancialPage() {
  const data = await getFinancialData()
  const recent = await getRecentPeriods(8)
  const latest = recent.at(-1)!
  const prior = recent.at(-2) ?? null

  const headline = generateFinancialHeadline(latest, prior)
  const bullets = buildBulletData(data.periods)
  const profitData = buildProfitComposition(recent)
  const waterfall = prior ? buildRevenueWaterfall(latest, prior) : []

  // Sparklines
  const labels = recent.map((p) => p.periodLabel)
  const revenueSpark = recent.map((p) => p.insuranceRevenue ?? 0)
  const profitSpark = recent.map((p) => p.netProfit ?? 0)
  const lossRatioSpark = recent.map((p) => p.lossRatio ?? 0)
  const marginSpark = recent.map((p) => p.netMargin ?? 0)
  const investmentSpark = recent.map((p) => p.investmentResult ?? 0)

  // Deltas
  const marginDelta = (latest.netMargin ?? 0) - (prior?.netMargin ?? 0)
  const lossDelta = (latest.lossRatio ?? 0) - (prior?.lossRatio ?? 0)
  const revenueDelta = latest.revenueYoY ?? 0
  const profitDelta = latest.netProfitYoY ?? 0
  const investmentDelta =
    ((latest.investmentResult ?? 0) - (prior?.investmentResult ?? 0)) /
    (prior?.investmentResult || 1)

  return (
    <div className="space-y-4">
      {/* Row 1 — Headline */}
      <KpiHero headline={headline} />

      {/* Row 2 — KPI strip */}
      <KpiStrip>
        <KpiTile
          id="fin-revenue"
          label="Insurance revenue (TTM)"
          rawValue={latest.ttmRevenue ?? latest.insuranceRevenue ?? 0}
          format="currency"
          delta={{ value: revenueDelta }}
          sparklineValues={revenueSpark}
          sparklineLabels={labels}
          subtext={`${fmt.percent(Math.abs(revenueDelta))} ${revenueDelta > 0 ? "growth" : "decline"} reflects rate increases and net member changes.`}
          emphasis
        />
        <KpiTile
          id="fin-profit"
          label="Net profit (TTM)"
          rawValue={latest.ttmNetProfit ?? latest.netProfit ?? 0}
          format="currency"
          delta={{ value: profitDelta }}
          sparklineValues={profitSpark}
          sparklineLabels={labels}
          subtext={
            profitDelta > 0
              ? "Year-on-year profit recovering from prior period."
              : "Year-on-year profit compressed — review composition below."
          }
        />
        <KpiTile
          id="fin-margin"
          label="Net margin"
          rawValue={(latest.netMargin ?? 0) * 100}
          format="pp"
          delta={{ value: marginDelta, unit: "pp" }}
          sparklineValues={marginSpark}
          sparklineLabels={labels}
          subtext="Net profit as a share of insurance revenue."
        />
        <KpiTile
          id="fin-loss"
          label="Loss ratio"
          rawValue={(latest.lossRatio ?? 0) * 100}
          format="pp"
          delta={{ value: lossDelta, unit: "pp", inverse: true }}
          sparklineValues={lossRatioSpark}
          sparklineLabels={labels}
          subtext="Claims as a share of revenue. Lower is better."
          inverse
        />
        <KpiTile
          id="fin-investment"
          label="Investment result"
          rawValue={latest.investmentResult ?? 0}
          format="currency"
          delta={{ value: investmentDelta }}
          sparklineValues={investmentSpark}
          sparklineLabels={labels}
          subtext="Quarterly net investment income — historically volatile."
        />
      </KpiStrip>

      {/* Row 3 — Bullet chart strip */}
      <Card>
        <SectionHeader
          title="Performance against target"
          subtitle="Each metric vs the 8-quarter rolling median. Black tick is target; coloured bar is actual."
        />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-5">
          {bullets.map((b) => (
            <BulletChart key={b.label} data={b} />
          ))}
        </div>
      </Card>

      {/* Row 4 — Hero chart (waterfall) + watch list */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-12 lg:col-span-8">
          <SectionHeader
            title="Revenue decomposition"
            subtitle={`Period-over-period change in insurance revenue, ${prior?.periodLabel} to ${latest.periodLabel}.`}
          />
          <WaterfallChart steps={waterfall} />
          <p className="text-caption text-text-tertiary mt-2">
            Decomposition is approximate; rate vs volume split estimated at 70/30 based on industry convention.
          </p>
        </Card>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-3">
          <Card>
            <SectionHeader title="Profit composition" subtitle="Underwriting vs investment result, post-tax estimate." />
            <div className="flex items-center gap-4 text-caption text-text-secondary mt-3 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-chart-1" /> Underwriting
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-chart-2" /> Investment
              </div>
            </div>
            <ProfitCompositionChart data={profitData} />
          </Card>
        </div>
      </div>

      {/* Row 5 — Detail table */}
      <Card>
        <SectionHeader title="Quarterly financials" subtitle="Industry aggregate, last eight quarters." />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-body-sm tabular">
            <thead>
              <tr className="border-b border-border-subtle text-text-secondary text-caption">
                <th className="text-left font-normal py-2 pr-4">Quarter</th>
                <th className="text-right font-normal py-2 px-4">Revenue</th>
                <th className="text-right font-normal py-2 px-4">Claims</th>
                <th className="text-right font-normal py-2 px-4">Loss ratio</th>
                <th className="text-right font-normal py-2 px-4">Underwriting profit</th>
                <th className="text-right font-normal py-2 px-4">Investment</th>
                <th className="text-right font-normal py-2 px-4">Net profit</th>
                <th className="text-right font-normal py-2 pl-4">Net margin</th>
              </tr>
            </thead>
            <tbody>
              {recent
                .slice()
                .reverse()
                .map((p) => (
                  <tr
                    key={p.periodEnd}
                    className="border-b border-border-subtle last:border-b-0 hover:bg-subtle transition-colors"
                  >
                    <td className="py-2.5 pr-4">{p.periodLabel}</td>
                    <td className="py-2.5 px-4 text-right">{fmt.currency(p.insuranceRevenue ?? 0)}</td>
                    <td className="py-2.5 px-4 text-right">{fmt.currency(p.incurredClaims ?? 0)}</td>
                    <td className="py-2.5 px-4 text-right">{fmt.percent(p.lossRatio ?? 0)}</td>
                    <td className="py-2.5 px-4 text-right">{fmt.currency(p.insuranceServiceResult ?? 0)}</td>
                    <td className="py-2.5 px-4 text-right">{fmt.currency(p.investmentResult ?? 0)}</td>
                    <td className="py-2.5 px-4 text-right">{fmt.currency(p.netProfit ?? 0)}</td>
                    <td className="py-2.5 pl-4 text-right">{fmt.percent(p.netMargin ?? 0)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}