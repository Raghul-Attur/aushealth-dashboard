import { KpiHero } from "@/components/kpi/kpi-hero"
import { KpiTile } from "@/components/kpi/kpi-tile"
import { KpiStrip } from "@/components/kpi/kpi-strip"
import { SectionHeader } from "@/components/layout/section-header"
import { WatchListCard } from "@/components/layout/watch-list-card"
import { LayeredAreaChart } from "@/components/charts/layered-area"
import { Icon } from "@/components/icons/icon-defs"
import { getFinancialData, getRecentPeriods } from "@/lib/data/loaders"
import { generateHeadline, generateWatchList } from "@/lib/insights"
import { fmt } from "@/lib/format"
import type { Period } from "@/lib/data/schemas"

/**
 * Editorial subtext for each KPI tile. One-line interpretation grounded in data.
 */
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
          return `Down from ${(yearAgo.ttmNetMargin * 100).toFixed(1)}% a year ago. Fourth consecutive quarter of compression.`
        }
        if (delta > 0.005) {
          return `Up from ${(yearAgo.ttmNetMargin * 100).toFixed(1)}% a year ago, margin expanding.`
        }
      }
      return "TTM margin holding within range, stable underwriting result."
    }
    case "revenue": {
      if (latest.revenueYoY) {
        return `${latest.revenueYoY > 0 ? "Growth" : "Decline"} of ${Math.abs(latest.revenueYoY * 100).toFixed(1)}% reflects premium rate increases and net member changes.`
      }
      return "Trailing twelve months, smooths quarterly seasonality."
    }
    case "net-profit": {
      const investmentShare =
        latest.investmentResult && latest.netProfit
          ? Math.round((latest.investmentResult / latest.netProfit) * 100)
          : null
      if (investmentShare !== null && investmentShare > 0) {
        return `Investment income contributed ~${investmentShare}% of profit this quarter.`
      }
      return "After-tax profit from continuing operations."
    }
    case "loss-ratio": {
      const avg =
        recent.reduce((s, p) => s + (p.lossRatio ?? 0), 0) / recent.length
      const delta = (latest.lossRatio ?? 0) - avg
      if (delta > 0.005) {
        return `Tracking ${(delta * 100).toFixed(1)}pp above 8-quarter average. Claims growing faster than premiums.`
      }
      return `Within the 8-quarter normal range, stable claims experience.`
    }
    case "investment": {
      if (prior?.investmentResult && latest.investmentResult) {
        const change =
          (latest.investmentResult - prior.investmentResult) /
          prior.investmentResult
        if (Math.abs(change) > 0.2) {
          return `${change > 0 ? "Recovery" : "Reversal"} from prior quarter. Q4 typically the most volatile.`
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

  const headline = generateHeadline(latest, prior)
  const watchList = generateWatchList(data.periods)

  // Sparkline series
  const marginSpark = recent.map((p) => (p.netMargin ?? 0) * 100)
  const revenueSpark = recent.map((p) => p.insuranceRevenue ?? 0)
  const profitSpark = recent.map((p) => p.netProfit ?? 0)
  const lossRatioSpark = recent.map((p) => (p.lossRatio ?? 0) * 100)
  const investmentSpark = recent.map((p) => p.investmentResult ?? 0)
  const labels = recent.map((p) => p.periodLabel)

  // Deltas
  const marginDelta = (latest.netMargin ?? 0) - (prior?.netMargin ?? 0)
  const revenueDelta = latest.revenueYoY ?? 0
  const profitDelta = latest.netProfitYoY ?? 0
  const investmentDelta =
    ((latest.investmentResult ?? 0) - (prior?.investmentResult ?? 0)) /
    (prior?.investmentResult || 1)

  // 8-quarter loss ratio average for the loss-ratio tile
  const avgLossRatio =
    recent.reduce((s, p) => s + (p.lossRatio ?? 0), 0) / recent.length
  const lossRatioVsAvg = (latest.lossRatio ?? 0) - avgLossRatio

  // Health card threshold
  const lossRatioPp = (latest.lossRatio ?? 0) * 100
  const lossRatioVsAvgPp = lossRatioVsAvg * 100

  // Capital base for the capital watch item, if present
  const capitalBase = latest.capitalBase

  return (
    <div className="space-y-6">
      {/* Hero headline */}
      <KpiHero headline={headline} />

      {/* KPI strip: first tile is the deep navy hero KPI */}
      <KpiStrip>
        <KpiTile
          id="net-margin"
          label="Net margin · This quarter"
          rawValue={(latest.netMargin ?? 0) * 100}
          format="pp"
          delta={{ value: marginDelta, unit: "pp" }}
          sparklineValues={marginSpark}
          sparklineLabels={labels}
          subtext={subtextFor("net-margin", latest, recent)}
          footnote={[
            prior?.netMargin
              ? `vs prior ${(prior.netMargin * 100).toFixed(2)}%`
              : "vs prior",
            latest.ttmNetMargin
              ? `TTM ${(latest.ttmNetMargin * 100).toFixed(2)}%`
              : "",
          ]}
          tint="deep"
          labelIcon="pct"
          cornerIcon="arrow-up-right"
        />

        <KpiTile
          id="revenue"
          label="Insurance rev (TTM)"
          rawValue={latest.ttmRevenue ?? latest.insuranceRevenue ?? 0}
          format="currency"
          delta={{ value: revenueDelta }}
          sparklineValues={revenueSpark}
          sparklineLabels={labels}
          subtext={subtextFor("revenue", latest, recent)}
          footnote={[
            latest.insuranceRevenue
              ? `${fmt.currency(latest.insuranceRevenue)} Q`
              : "",
            `${recent.length} quarters`,
          ]}
          labelIcon="coin"
          cornerIcon="trend-up"
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
          footnote={[
            latest.netProfit ? `${fmt.currency(latest.netProfit)} Q` : "",
            "After tax",
          ]}
          labelIcon="bar-chart"
          cornerIcon={profitDelta >= 0 ? "trend-up" : "trend-down"}
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
          footnote={[
            `Avg ${(avgLossRatio * 100).toFixed(1)}%`,
            lossRatioVsAvg > 0 ? "Above average" : "Below average",
          ]}
          inverse
          tint="cream"
          labelIcon="stethoscope"
          cornerIcon="alert"
        />

        <KpiTile
          id="investment"
          label="Investment result"
          rawValue={latest.investmentResult ?? 0}
          format="currency"
          delta={{ value: investmentDelta }}
          sparklineValues={investmentSpark}
          sparklineLabels={labels}
          subtext={subtextFor("investment", latest, recent)}
          footnote={[
            prior?.investmentResult
              ? `Prior ${fmt.currency(prior.investmentResult)}`
              : "",
            "Portfolio",
          ]}
          labelIcon="spark"
          cornerIcon="activity"
        />
      </KpiStrip>

      {/* Main grid: chart panel + watch list */}
      <div className="grid grid-cols-12 gap-3.5">
        <div className="col-span-12 flex flex-col gap-3.5 lg:col-span-8">
          <RevenueChartPanel periods={recent} latest={latest} />

          <HealthCard
            lossRatioPp={lossRatioPp}
            lossRatioVsAvgPp={lossRatioVsAvgPp}
          />
        </div>

        <div className="col-span-12 flex flex-col gap-3 lg:col-span-4">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-bupa-blue-deep">
              <Icon name="eye-open" size="sm" className="text-bupa-blue" />
              Watch list
              <span className="text-text-tertiary">
                · {watchList.length} item{watchList.length === 1 ? "" : "s"}
              </span>
            </span>
            <a
              href="#all-watch"
              className="inline-flex items-center gap-1 font-sans text-caption font-medium text-bupa-navy hover:text-bupa-blue-deep"
            >
              View all <Icon name="arrow-right" size="sm" />
            </a>
          </div>

          {watchList.length > 0 ? (
            watchList.map((item, i) => <WatchListCard key={i} item={item} />)
          ) : (
            <div className="glass-strong rounded-[20px] p-5 font-serif text-body font-light italic text-text-secondary">
              No items requiring attention this period.
            </div>
          )}

          {capitalBase && (
            <CapitalCard capitalBase={capitalBase} />
          )}
        </div>
      </div>

      {/* Quarterly table */}
      <div className="glass">
        <SectionHeader
          eyebrow="Detail"
          eyebrowIcon="doc"
          title="Quarterly performance."
          emphasis="performance"
          subtitle="Industry aggregate, last eight quarters. APRA quarterly statistics."
          right={
            <button className="glass-strong inline-flex h-9 items-center gap-2 rounded-full px-4 font-sans text-caption font-medium text-bupa-navy hover:bg-bupa-navy hover:text-white">
              <Icon name="download" size="sm" />
              Download CSV
            </button>
          }
        />
        <div className="mt-4 overflow-x-auto">
          <QuarterlyTable periods={recent} />
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   Sub-components
   ============================================================ */

function RevenueChartPanel({
  periods,
  latest,
}: {
  periods: Period[]
  latest: Period
}) {
  return (
    <div className="glass">
      <SectionHeader
        eyebrow="Revenue and claims"
        eyebrowIcon="activity"
        title="Revenue and claims, by quarter."
        emphasis="and"
        subtitle="Premium revenue and incurred claims across the last eight quarters. The space between is gross underwriting margin."
      />

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-5 font-sans text-caption text-text-secondary">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-bupa-navy" />
          Revenue
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm bg-bupa-blue" />
          Incurred claims
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="inline-block h-3 w-3 rounded-sm"
            style={{
              background:
                "linear-gradient(180deg, rgba(75,58,154,0.5), rgba(75,58,154,0.05))",
              border: "1px solid rgba(75,58,154,0.4)",
            }}
          />
          Underwriting margin
        </span>
      </div>

      <div className="relative mt-4">
        <LayeredAreaChart periods={periods} />

        {/* Pinned callouts for the latest period */}
        <div className="pointer-events-none absolute right-0 top-2 flex flex-col items-end gap-2">
          {latest.insuranceRevenue && (
            <ChartCallout
              tone="navy"
              icon="coin"
              label={`Revenue · ${latest.periodLabel}`}
              value={fmt.currency(latest.insuranceRevenue)}
            />
          )}
          {latest.incurredClaims && (
            <ChartCallout
              tone="blue"
              icon="stethoscope"
              label={`Claims · ${latest.periodLabel}`}
              value={fmt.currency(latest.incurredClaims)}
            />
          )}
        </div>
      </div>
    </div>
  )
}

function ChartCallout({
  tone,
  icon,
  label,
  value,
}: {
  tone: "navy" | "blue"
  icon: "coin" | "stethoscope"
  label: string
  value: string
}) {
  const bg = tone === "navy" ? "bg-bupa-navy" : "bg-bupa-blue"
  return (
    <div
      className={`rounded-xl px-3.5 py-2.5 text-white shadow-[0_14px_30px_-10px_rgba(10,31,68,0.5)] ${bg}`}
      style={{ minWidth: 160 }}
    >
      <div className="inline-flex items-center gap-1.5 font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
        <Icon name={icon} size="sm" style={{ color: "#fff" }} />
        {label}
      </div>
      <div
        className="mt-1 font-serif text-[22px] font-normal italic leading-tight tabular"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
      >
        {value}
      </div>
    </div>
  )
}

function HealthCard({
  lossRatioPp,
  lossRatioVsAvgPp,
}: {
  lossRatioPp: number
  lossRatioVsAvgPp: number
}) {
  const above = lossRatioVsAvgPp > 0
  return (
    <div className="glass">
      <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr_auto]">
        <div className="relative">
          <div
            className="flex h-[84px] w-[84px] items-center justify-center rounded-[24px] text-[#6e4f15]"
            style={{
              background: "linear-gradient(160deg, #f7e6cf, #e9bf6c)",
              boxShadow:
                "0 12px 30px -10px rgba(193,154,75,0.5), inset 0 0 0 1px rgba(255,255,255,0.7)",
            }}
            aria-hidden
          >
            <Icon name="shield-plus" size="xl" />
          </div>
          <span
            className="animate-ring-spin pointer-events-none absolute -inset-2 rounded-[30px]"
            style={{ border: "1px dashed rgba(193,154,75,0.55)" }}
            aria-hidden
          />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
            <Icon name="alert" size="sm" />
            Industry health · This quarter
          </div>
          <h3
            className="mt-2 max-w-[680px] font-serif text-[24px] font-light leading-[1.18] tracking-[-0.018em] text-bupa-navy lg:text-[28px]"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
          >
            {above ? "Watch: " : "Stable: "}
            claims are{" "}
            <em className="font-light italic text-bupa-blue-deep">
              {above ? "growing faster than premiums" : "tracking premiums closely"}
            </em>
            .
          </h3>
          <p className="mt-2 max-w-[680px] font-serif text-body font-light italic leading-[1.55] text-text-secondary">
            Loss ratio of {lossRatioPp.toFixed(1)}% sits{" "}
            {Math.abs(lossRatioVsAvgPp).toFixed(1)} pp{" "}
            {above ? "above" : "below"} the eight-quarter average.
            {above
              ? " Net margin compression has not yet breached the 4.0% action threshold, but continued trend through FY2026 would warrant board-level pricing review."
              : " Net margin held within historical range."}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className="font-serif text-[38px] font-light italic leading-none tracking-[-0.02em] tabular text-bupa-navy"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 40' }}
          >
            {lossRatioPp.toFixed(1)}
            <span className="text-[18px] text-text-secondary">%</span>
          </span>
          <span className="font-sans text-[11px] uppercase tracking-[0.14em] text-text-tertiary">
            Loss ratio
          </span>
        </div>
      </div>
    </div>
  )
}

function CapitalCard({ capitalBase }: { capitalBase: number }) {
  return (
    <button
      type="button"
      className="group grid grid-cols-[36px_1fr_auto] items-start gap-3.5 rounded-[20px] p-5 text-left transition-transform hover:-translate-y-[2px]"
      style={{
        background:
          "linear-gradient(150deg, rgba(0,121,200,0.12), rgba(255,255,255,0.78))",
        backdropFilter: "blur(24px) saturate(160%)",
        border: "1px solid rgba(255,255,255,0.92)",
        boxShadow: "0 8px 24px -12px rgba(10,31,68,0.22)",
      }}
    >
      <span
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-bupa-blue-deep"
        style={{ background: "rgba(0,121,200,0.14)" }}
        aria-hidden
      >
        <Icon name="vault" />
      </span>
      <div className="min-w-0">
        <span className="inline-flex items-center rounded-full bg-bupa-blue/[0.14] px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-bupa-blue-deep">
          Capital
        </span>
        <div className="mt-1.5 font-serif text-[18px] leading-[1.2] tracking-[-0.015em] text-bupa-navy">
          Capital base {fmt.currency(capitalBase)}
        </div>
        <div className="mt-1 font-serif text-[13px] font-light italic leading-[1.5] text-text-secondary">
          Stable QoQ, comfortably above prudential capital requirement.
        </div>
      </div>
      <span className="self-center text-text-tertiary group-hover:text-bupa-navy">
        <Icon name="arrow-right" />
      </span>
    </button>
  )
}

function QuarterlyTable({ periods }: { periods: Period[] }) {
  const rows = periods.slice().reverse()
  const current = rows[0]
  return (
    <table className="w-full font-sans text-body-sm tabular">
      <thead>
        <tr className="text-text-tertiary">
          <th className="border-b border-border-subtle py-3 pr-4 text-left font-sans text-[11px] font-medium uppercase tracking-[0.12em]">
            Quarter
          </th>
          {["Revenue", "Claims", "Loss ratio", "Underwriting", "Net profit", "Net margin", "Capital base"].map(
            (h) => (
              <th
                key={h}
                className="border-b border-border-subtle py-3 px-4 text-right font-sans text-[11px] font-medium uppercase tracking-[0.12em]"
              >
                {h}
              </th>
            )
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => {
          const isCurrent = p.periodEnd === current?.periodEnd
          return (
            <tr
              key={p.periodEnd}
              className="border-b border-border-subtle/60 last:border-b-0 hover:bg-white/50"
            >
              <td className="py-3 pr-4 font-serif text-[15px] text-bupa-navy">
                <span
                  className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                  style={{
                    background: isCurrent
                      ? "var(--color-bupa-blue)"
                      : "rgba(10,31,68,0.18)",
                  }}
                  aria-hidden
                />
                {p.quarter} · {p.periodLabel}
              </td>
              <td className="py-3 px-4 text-right font-serif text-bupa-ink-2">
                {fmt.currency(p.insuranceRevenue ?? 0)}
              </td>
              <td className="py-3 px-4 text-right font-serif text-bupa-ink-2">
                {fmt.currency(p.incurredClaims ?? 0)}
              </td>
              <td className="py-3 px-4 text-right">
                {p.lossRatio !== undefined && (
                  <PillCell value={p.lossRatio} threshold={0.85} inverse />
                )}
              </td>
              <td className="py-3 px-4 text-right font-serif text-bupa-ink-2">
                {p.insuranceServiceResult !== undefined
                  ? fmt.percent(
                      p.insuranceServiceResult / (p.insuranceRevenue ?? 1)
                    )
                  : "–"}
              </td>
              <td className="py-3 px-4 text-right font-serif text-bupa-ink-2">
                {fmt.currency(p.netProfit ?? 0)}
              </td>
              <td className="py-3 px-4 text-right">
                {p.netMargin !== undefined && (
                  <PillCell value={p.netMargin} threshold={0.06} />
                )}
              </td>
              <td className="py-3 px-4 text-right font-serif text-bupa-ink-2">
                {p.capitalBase ? fmt.currency(p.capitalBase) : "–"}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function PillCell({
  value,
  threshold,
  inverse = false,
}: {
  value: number
  threshold: number
  inverse?: boolean
}) {
  const above = value > threshold
  const good = inverse ? !above : above
  const cls = good ? "bg-positive-bg text-positive" : "bg-negative-bg text-negative"
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[11px] font-medium ${cls}`}
    >
      {fmt.percent(value)}
    </span>
  )
}
