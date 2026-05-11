import { KpiHero } from "@/components/kpi/kpi-hero"
import { KpiTile } from "@/components/kpi/kpi-tile"
import { KpiStrip } from "@/components/kpi/kpi-strip"
import { Card } from "@/components/layout/card"
import { SectionHeader } from "@/components/layout/section-header"
import { WatchListCard } from "@/components/layout/watch-list-card"
import { LayeredAreaChart } from "@/components/charts/layered-area"
import { StoryFrame } from "@/components/story/story-frame"
import { OverviewStory } from "@/components/story/overview-story"
import { getFinancialData, getRecentPeriods } from "@/lib/data/loaders"
import { generateHeadline, generateWatchList } from "@/lib/insights"
import { fmt } from "@/lib/format"
import type { Period } from "@/lib/data/schemas"

function subtextFor(
  metric: "net-margin" | "revenue" | "net-profit" | "loss-ratio" | "investment",
  latest: Period,
  recent: Period[]
): string {
  const prior = recent.at(-2)
  const yearAgo = recent.at(-5)

  switch (metric) {
    case "net-margin": {
      if (yearAgo?.ttmNetMargin && latest.ttmNetMargin) {
        const delta = latest.ttmNetMargin - yearAgo.ttmNetMargin
        if (delta < -0.005) {
          return `Down from ${(yearAgo.ttmNetMargin * 100).toFixed(1)}% a year ago — fourth consecutive quarter of compression.`
        }
        if (delta > 0.005) {
          return `Up from ${(yearAgo.ttmNetMargin * 100).toFixed(1)}% a year ago — margin expanding.`
        }
      }
      return "TTM margin holding within range — stable underwriting result."
    }
    case "revenue": {
      if (latest.revenueYoY) {
        return `${latest.revenueYoY > 0 ? "Growth" : "Decline"} of ${Math.abs(latest.revenueYoY * 100).toFixed(1)}% reflects premium rate increases and net member changes.`
      }
      return "Trailing twelve months — smooths quarterly seasonality."
    }
    case "net-profit": {
      const investmentShare = latest.investmentResult && latest.netProfit
        ? Math.round((latest.investmentResult / latest.netProfit) * 100)
        : null
      if (investmentShare !== null && investmentShare > 0) {
        return `Investment income contributed ~${investmentShare}% of profit this quarter.`
      }
      return "After-tax profit from continuing operations."
    }
    case "loss-ratio": {
      const avg = recent.reduce((s, p) => s + (p.lossRatio ?? 0), 0) / recent.length
      const delta = (latest.lossRatio ?? 0) - avg
      if (delta > 0.005) {
        return `Tracking ${(delta * 100).toFixed(1)}pp above 8-quarter average — claims growing faster than premiums.`
      }
      return `Within the 8-quarter normal range — stable claims experience.`
    }
    case "investment": {
      if (prior?.investmentResult && latest.investmentResult) {
        const change = (latest.investmentResult - prior.investmentResult) / prior.investmentResult
        if (Math.abs(change) > 0.2) {
          return `${change > 0 ? "Recovery" : "Reversal"} from prior quarter — Q4 typically the most volatile.`
        }
      }
      return "Investment income from underlying portfolios."
    }
  }
}

export default async function OverviewPage() {
  const data = await getFinancialData()
  const recent = await getRecentPeriods(8)
  const latest = recent.at(-1)!
  const prior = recent.at(-2) ?? null
  const yearAgo = recent.at(-5) ?? null

  const headline = generateHeadline(latest, prior)
  const watchList = generateWatchList(data.periods)

  // Build sparkline arrays from recent periods
  const labels = recent.map((p) => p.periodLabel)
  const marginSpark = recent.map((p) => p.netMargin ?? 0)
  const revenueSpark = recent.map((p) => p.insuranceRevenue ?? 0)
  const profitSpark = recent.map((p) => p.netProfit ?? 0)
  const lossRatioSpark = recent.map((p) => p.lossRatio ?? 0)
  const investmentSpark = recent.map((p) => p.investmentResult ?? 0)

  // Deltas vs prior period
  const marginDelta = (latest.netMargin ?? 0) - (prior?.netMargin ?? 0)
  const revenueDelta = latest.revenueYoY ?? 0
  const profitDelta = latest.netProfitYoY ?? 0

  const exploreView = (
    <div className="space-y-4">
      {/* Row 1 — Headline */}
      <KpiHero headline={headline} />

      {/* Row 2 — KPI strip */}
      <KpiStrip>
        <KpiTile
          id="net-margin"
          label="Net margin"
          rawValue={(latest.netMargin ?? 0) * 100}
          format="pp"
          delta={{ value: marginDelta, unit: "pp" }}
          sparklineValues={marginSpark}
          sparklineLabels={labels}
          subtext={subtextFor("net-margin", latest, recent)}
          emphasis
        />
        <KpiTile
          id="revenue"
          label="Insurance revenue (TTM)"
          rawValue={latest.ttmRevenue ?? latest.insuranceRevenue ?? 0}
          format="currency"
          delta={{ value: revenueDelta }}
          sparklineValues={revenueSpark}
          sparklineLabels={labels}
          subtext={subtextFor("revenue", latest, recent)}
        />
        <KpiTile
          id="net-profit"
          label="Net profit (TTM)"
          rawValue={latest.ttmNetProfit ?? latest.netProfit ?? 0}
          format="currency"
          delta={{ value: profitDelta }}
          sparklineValues={profitSpark}
          sparklineLabels={labels}
          subtext={subtextFor("net-profit", latest, recent)}
        />
        <KpiTile
          id="loss-ratio"
          label="Loss ratio"
          rawValue={(latest.lossRatio ?? 0) * 100}
          format="pp"
          delta={{
            value: (latest.lossRatio ?? 0) - (prior?.lossRatio ?? 0),
            unit: "pp",
            inverse: true,
          }}
          sparklineValues={lossRatioSpark}
          sparklineLabels={labels}
          subtext={subtextFor("loss-ratio", latest, recent)}
          inverse
        />
        <KpiTile
          id="investment"
          label="Investment result"
          rawValue={latest.investmentResult ?? 0}
          format="currency"
          delta={{
            value:
              ((latest.investmentResult ?? 0) - (prior?.investmentResult ?? 0)) /
              (prior?.investmentResult || 1),
          }}
          sparklineValues={investmentSpark}
          sparklineLabels={labels}
          subtext={subtextFor("investment", latest, recent)}
        />
      </KpiStrip>

      {/* Row 3 — Hero chart + watch list */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-12 lg:col-span-8">
          <SectionHeader
            title="Revenue and claims"
            subtitle="Premium revenue and incurred claims by quarter. The space between is gross margin."
          />
          <div className="flex items-center gap-4 text-caption text-text-secondary mt-3 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-chart-1" /> Revenue
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-chart-2" /> Claims
            </div>
          </div>
          <LayeredAreaChart periods={recent} />
        </Card>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-2">
          <div className="text-caption text-text-secondary uppercase tracking-wider px-1">
            Watch list
          </div>
          {watchList.length > 0 ? (
            watchList.map((item, i) => <WatchListCard key={i} item={item} />)
          ) : (
            <Card>
              <p className="text-body-sm text-text-secondary">
                No items requiring attention this period.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Row 4 — Detail table */}
      <Card>
        <SectionHeader
          title="Quarterly performance"
          subtitle="Industry aggregate, last eight quarters."
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-body-sm tabular">
            <thead>
              <tr className="border-b border-border-subtle text-text-secondary text-caption">
                <th className="text-left font-normal py-2 pr-4">Quarter</th>
                <th className="text-right font-normal py-2 px-4">Revenue</th>
                <th className="text-right font-normal py-2 px-4">Claims</th>
                <th className="text-right font-normal py-2 px-4">Loss ratio</th>
                <th className="text-right font-normal py-2 px-4">Net profit</th>
                <th className="text-right font-normal py-2 pl-4">Net margin</th>
              </tr>
            </thead>
            <tbody>
              {recent.slice().reverse().map((p) => (
                <tr
                  key={p.periodEnd}
                  className="border-b border-border-subtle last:border-b-0 hover:bg-subtle transition-colors"
                >
                  <td className="py-2.5 pr-4">{p.periodLabel}</td>
                  <td className="py-2.5 px-4 text-right">{fmt.currency(p.insuranceRevenue ?? 0)}</td>
                  <td className="py-2.5 px-4 text-right">{fmt.currency(p.incurredClaims ?? 0)}</td>
                  <td className="py-2.5 px-4 text-right">{fmt.percent(p.lossRatio ?? 0)}</td>
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

  const storyView = (
    <OverviewStory
      headline={headline}
      latest={latest}
      prior={prior}
      yearAgo={yearAgo}
      recent={recent}
      watchList={watchList}
    />
  )

  return <StoryFrame story={storyView} explore={exploreView} />
}