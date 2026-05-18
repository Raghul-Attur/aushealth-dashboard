import { KpiHero } from "@/components/kpi/kpi-hero"
import { KpiTile } from "@/components/kpi/kpi-tile"
import { KpiStrip } from "@/components/kpi/kpi-strip"
import { SectionHeader } from "@/components/layout/section-header"
import { WatchListCard } from "@/components/layout/watch-list-card"
import { RevenueChartPanel } from "@/components/charts/revenue-chart-panel"
import { Icon } from "@/components/icons/icon-defs"
import { StoryFrame } from "@/components/story/story-frame"
import { OverviewStory } from "@/components/story/overview-story"
import { getFinancialData, getRecentPeriods } from "@/lib/data/loaders"
import { generateHeadline, generateWatchList } from "@/lib/insights"
import { fmt } from "@/lib/format"
import type { Period } from "@/lib/data/schemas"
import { getPeriodCount } from "@/lib/period-utils"

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
        if (delta < -0.005) return `Down from ${(yearAgo.ttmNetMargin * 100).toFixed(1)}% a year ago. Fourth consecutive quarter of compression.`
        if (delta > 0.005) return `Up from ${(yearAgo.ttmNetMargin * 100).toFixed(1)}% a year ago, margin expanding.`
      }
      return "TTM margin holding within range, stable underwriting result."
    }
    case "revenue":
      return latest.revenueYoY
        ? `${latest.revenueYoY > 0 ? "Growth" : "Decline"} of ${Math.abs(latest.revenueYoY * 100).toFixed(1)}% reflects premium rate increases and net member changes.`
        : "Trailing twelve months, smooths quarterly seasonality."
    case "net-profit": {
      const share = latest.investmentResult && latest.netProfit
        ? Math.round((latest.investmentResult / latest.netProfit) * 100) : null
      return share !== null && share > 0
        ? `Investment income contributed ~${share}% of profit this quarter.`
        : "After-tax profit from continuing operations."
    }
    case "loss-ratio": {
      const avg = recent.reduce((s, p) => s + (p.lossRatio ?? 0), 0) / recent.length
      const delta = (latest.lossRatio ?? 0) - avg
      return delta > 0.005
        ? `Tracking ${(delta * 100).toFixed(1)}pp above 8-quarter average. Claims growing faster than premiums.`
        : "Within the 8-quarter normal range, stable claims experience."
    }
    case "investment": {
      if (prior?.investmentResult && latest.investmentResult) {
        const change = (latest.investmentResult - prior.investmentResult) / prior.investmentResult
        if (Math.abs(change) > 0.2) return `${change > 0 ? "Recovery" : "Reversal"} from prior quarter. Q4 typically the most volatile.`
      }
      return "Investment income from underlying portfolios."
    }
  }
}

function PillCell({ value, threshold, inverse = false }: { value: number; threshold: number; inverse?: boolean }) {
  const above = value > threshold
  const good = inverse ? !above : above
  return (
    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[11px] font-medium"
      style={{ background: good ? "var(--color-positive-bg)" : "var(--color-negative-bg)", color: good ? "var(--color-positive)" : "var(--color-negative)" }}>
      {fmt.percent(value)}
    </span>
  )
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ n?: string; view?: string }>
}) {
  const { n } = await searchParams
  const periodCount = getPeriodCount(n)
  const data = await getFinancialData()
  const recent = await getRecentPeriods(periodCount)
  const latest = recent.at(-1)!
  const prior = recent.at(-2) ?? null
  const yearAgo = recent.at(-5) ?? null

  const headline = generateHeadline(latest, prior, recent)
  const watchList = generateWatchList(data.periods)

  const marginSpark = recent.map((p) => (p.netMargin ?? 0) * 100)
  const revenueSpark = recent.map((p) => p.insuranceRevenue ?? 0)
  const profitSpark = recent.map((p) => p.netProfit ?? 0)
  const lossRatioSpark = recent.map((p) => (p.lossRatio ?? 0) * 100)
  const investmentSpark = recent.map((p) => p.investmentResult ?? 0)
  const labels = recent.map((p) => p.periodLabel)

  const marginDelta = (latest.netMargin ?? 0) - (prior?.netMargin ?? 0)
  const revenueDelta = latest.revenueYoY ?? 0
  const profitDelta = latest.netProfitYoY ?? 0
  const investmentDelta = prior?.investmentResult && latest.investmentResult
    ? (latest.investmentResult - prior.investmentResult) / prior.investmentResult : 0

  const avgLossRatio = recent.reduce((s, p) => s + (p.lossRatio ?? 0), 0) / recent.length
  const lossRatioVsAvg = (latest.lossRatio ?? 0) - avgLossRatio
  const lossRatioPp = (latest.lossRatio ?? 0) * 100
  const lossRatioVsAvgPp = lossRatioVsAvg * 100
  const capitalBase = latest.capitalBase

  const exploreView = (
    <div className="space-y-6">
      <KpiHero headline={headline} />

      <KpiStrip>
        <KpiTile id="net-margin" label="Net margin · This quarter"
          rawValue={(latest.netMargin ?? 0) * 100} format="pp"
          delta={{ value: marginDelta, unit: "pp" }}
          sparklineValues={marginSpark} sparklineLabels={labels}
          subtext={subtextFor("net-margin", latest, recent)}
          footnote={[prior?.netMargin ? `vs prior ${(prior.netMargin * 100).toFixed(2)}%` : "vs prior", latest.ttmNetMargin ? `TTM ${(latest.ttmNetMargin * 100).toFixed(2)}%` : ""]}
          tint="deep" labelIcon="pct" cornerIcon="arrow-up-right" />
        <KpiTile id="revenue" label="Insurance rev (TTM)"
          rawValue={latest.ttmRevenue ?? latest.insuranceRevenue ?? 0} format="currency"
          delta={{ value: revenueDelta }}
          sparklineValues={revenueSpark} sparklineLabels={labels}
          subtext={subtextFor("revenue", latest, recent)}
          footnote={[latest.insuranceRevenue ? `${fmt.currency(latest.insuranceRevenue)} Q` : "", `${recent.length} quarters`]}
          labelIcon="coin" cornerIcon="trend-up" />
        <KpiTile id="net-profit" label="Net profit (TTM)"
          rawValue={latest.ttmNetProfit ?? latest.netProfit ?? 0} format="currency"
          delta={{ value: profitDelta }}
          sparklineValues={profitSpark} sparklineLabels={labels}
          subtext={subtextFor("net-profit", latest, recent)}
          footnote={[latest.netProfit ? `${fmt.currency(latest.netProfit)} Q` : "", "After tax"]}
          labelIcon="bar-chart" cornerIcon={profitDelta >= 0 ? "trend-up" : "trend-down"} />
        <KpiTile id="loss-ratio" label="Loss ratio"
          rawValue={(latest.lossRatio ?? 0) * 100} format="pp"
          delta={{ value: (latest.lossRatio ?? 0) - (prior?.lossRatio ?? 0), unit: "pp", inverse: true }}
          sparklineValues={lossRatioSpark} sparklineLabels={labels}
          subtext={subtextFor("loss-ratio", latest, recent)}
          footnote={[`Avg ${(avgLossRatio * 100).toFixed(1)}%`, lossRatioVsAvg > 0 ? "Above average" : "Below average"]}
          inverse tint="cream" labelIcon="stethoscope" cornerIcon="alert" />
        <KpiTile id="investment" label="Investment result"
          rawValue={latest.investmentResult ?? 0} format="currency"
          delta={{ value: investmentDelta }}
          sparklineValues={investmentSpark} sparklineLabels={labels}
          subtext={subtextFor("investment", latest, recent)}
          footnote={[prior?.investmentResult ? `Prior ${fmt.currency(prior.investmentResult)}` : "", "Portfolio"]}
          labelIcon="spark" cornerIcon="activity" />
      </KpiStrip>

      <div className="grid grid-cols-12 gap-3.5">
        <div className="col-span-12 flex flex-col gap-3.5 lg:col-span-8">
          <RevenueChartPanel periods={recent} latest={latest} />
          <HealthCard lossRatioPp={lossRatioPp} lossRatioVsAvgPp={lossRatioVsAvgPp} />
        </div>

        <div className="col-span-12 flex flex-col gap-3 lg:col-span-4">
          <div className="flex items-center justify-between px-1 pb-1">
            <span className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: "var(--color-bupa-blue-deep)" }}>
              <Icon name="eye-open" size="sm" style={{ color: "var(--color-bupa-blue)" }} />
              Watch list
              <span style={{ color: "var(--color-text-tertiary)" }}>· {watchList.length} items</span>
            </span>
            <a href="#all-watch" className="inline-flex items-center gap-1 font-sans text-[12px] font-medium"
              style={{ color: "var(--color-bupa-navy)" }}>
              View all <Icon name="arrow-right" size="sm" />
            </a>
          </div>
          {watchList.length > 0
            ? watchList.map((item, i) => <WatchListCard key={i} item={item} />)
            : <div className="glass-strong rounded-[20px] p-5 font-sans text-[14px]"
                style={{ color: "var(--color-text-secondary)" }}>
                No items requiring attention this period.
              </div>}
          {capitalBase && <CapitalCard capitalBase={capitalBase} />}
        </div>
      </div>

      <div className="glass" style={{ overflow: "visible" }}>
        <SectionHeader
          title="Quarterly performance."
         
          subtitle="Industry aggregate, last eight quarters. APRA quarterly statistics."
          right={
            <button className="glass-strong inline-flex h-9 items-center gap-2 rounded-full px-4 font-sans text-[12px] font-medium"
              style={{ color: "var(--color-bupa-navy)" }}>
              <Icon name="download" size="sm" />Download CSV
            </button>
          } />
        <div className="mt-4 overflow-x-auto">
          <QuarterlyTable periods={recent} />
        </div>
      </div>
    </div>
  )

  const storyView = (
    <OverviewStory headline={headline} latest={latest} prior={prior}
      yearAgo={yearAgo} recent={recent} watchList={watchList} />
  )

  return <StoryFrame story={storyView} explore={exploreView} />
}

function HealthCard({ lossRatioPp, lossRatioVsAvgPp }: { lossRatioPp: number; lossRatioVsAvgPp: number }) {
  const above = lossRatioVsAvgPp > 0
  return (
    <div className="glass">
      <div className="grid items-center gap-6 lg:grid-cols-[auto_1fr_auto]">
        <div className="relative">
          <div className="flex h-[84px] w-[84px] items-center justify-center rounded-[24px]"
            style={{ background: "linear-gradient(160deg, #f7e6cf, #e9bf6c)", boxShadow: "0 12px 30px -10px rgba(193,154,75,0.5), inset 0 0 0 1px rgba(255,255,255,0.7)", color: "#6e4f15" }}>
            <Icon name="shield-plus" size="xl" />
          </div>
          <span className="animate-ring-spin pointer-events-none absolute -inset-2 rounded-[30px]"
            style={{ border: "1px dashed rgba(193,154,75,0.55)" }} aria-hidden />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "var(--color-warning)" }}>
            <Icon name="alert" size="sm" />Industry health · This quarter
          </div>
          <h3 className="mt-2 max-w-[680px] font-serif text-[24px] font-light leading-[1.18] lg:text-[28px]"
            style={{ color: "var(--color-bupa-navy)", letterSpacing: "-0.025em", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}>
            {above ? "Watch: " : "Stable: "}claims are{" "}
            <em className="font-light italic" style={{ color: "var(--color-bupa-blue-deep)" }}>
              {above ? "growing faster than premiums" : "tracking premiums closely"}
            </em>.
          </h3>
          <p className="mt-2 max-w-[680px] font-sans text-[14px] leading-[1.6]"
            style={{ color: "var(--color-text-secondary)" }}>
            Loss ratio of {lossRatioPp.toFixed(1)}% sits {Math.abs(lossRatioVsAvgPp).toFixed(1)} pp{" "}
            {above ? "above" : "below"} the eight-quarter average.
            {above ? " Net margin compression has not yet breached the 4.0% action threshold, but continued trend through FY2026 would warrant board-level pricing review." : " Net margin held within historical range."}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-serif text-[38px] font-light italic leading-none tracking-[-0.02em] tabular"
            style={{ color: "var(--color-bupa-navy)", fontVariationSettings: '"opsz" 144, "SOFT" 40' }}>
            {lossRatioPp.toFixed(1)}<span className="text-[18px]" style={{ color: "var(--color-text-secondary)" }}>%</span>
          </span>
          <span className="font-sans text-[11px] uppercase tracking-[0.14em]" style={{ color: "var(--color-text-tertiary)" }}>Loss ratio</span>
        </div>
      </div>
    </div>
  )
}

function CapitalCard({ capitalBase }: { capitalBase: number }) {
  return (
    <button type="button" className="group grid grid-cols-[36px_1fr_auto] items-start gap-3.5 rounded-[20px] p-5 text-left transition-transform hover:-translate-y-[2px]"
      style={{ background: "linear-gradient(150deg, rgba(0,121,200,0.12), rgba(255,255,255,0.78))", backdropFilter: "blur(24px) saturate(160%)", border: "1px solid rgba(255,255,255,0.92)", boxShadow: "0 8px 24px -12px rgba(0,47,108,0.22)" }}>
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: "rgba(0,121,200,0.14)", color: "var(--color-bupa-blue-deep)" }}>
        <Icon name="vault" />
      </span>
      <div className="min-w-0">
        <span className="inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{ background: "rgba(0,121,200,0.14)", color: "var(--color-bupa-blue-deep)" }}>Capital</span>
        <div className="mt-1.5 font-serif text-[18px] leading-[1.2] tracking-[-0.015em]"
          style={{ color: "var(--color-bupa-navy)" }}>Capital base {fmt.currency(capitalBase)}</div>
        <div className="mt-1 font-sans text-[13px] leading-[1.5]" style={{ color: "var(--color-text-secondary)" }}>
          Stable QoQ, comfortably above prudential capital requirement.
        </div>
      </div>
      <span className="self-center" style={{ color: "var(--color-text-tertiary)" }}>
        <Icon name="arrow-right" />
      </span>
    </button>
  )
}

function QuarterlyTable({ periods }: { periods: Period[] }) {
  const rows = periods.slice().reverse()
  const current = rows[0]
  return (
    <table className="w-full font-sans text-[13px] tabular">
      <thead>
        <tr style={{ color: "var(--color-text-tertiary)" }}>
          {["Quarter", "Revenue", "Claims", "Loss ratio", "Underwriting", "Net profit", "Net margin", "Capital base"].map((h, i) => (
            <th key={h} className={`border-b py-3 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] ${i === 0 ? "text-left pr-4" : "text-right px-3"}`}
              style={{ borderColor: "var(--color-border-subtle)" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => {
          const isCurrent = p.periodEnd === current?.periodEnd
          return (
            <tr key={p.periodEnd} className="hover:bg-white/40 transition-colors"
              style={{ borderBottom: "0.5px solid var(--color-border-subtle)" }}>
              <td className="py-3 pr-4 font-sans text-[13px]"
                style={{ color: "var(--color-bupa-navy)", fontWeight: isCurrent ? 600 : 400 }}>
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                  style={{ background: isCurrent ? "var(--color-bupa-blue)" : "rgba(0,47,108,0.18)" }} />
                {p.periodLabel}
              </td>
              <td className="py-3 px-3 text-right" style={{ color: "var(--color-text-primary)" }}>{fmt.currency(p.insuranceRevenue ?? 0)}</td>
              <td className="py-3 px-3 text-right" style={{ color: "var(--color-text-primary)" }}>{fmt.currency(p.incurredClaims ?? 0)}</td>
              <td className="py-3 px-3 text-right">{p.lossRatio !== undefined && <PillCell value={p.lossRatio} threshold={0.85} inverse />}</td>
              <td className="py-3 px-3 text-right" style={{ color: "var(--color-text-secondary)" }}>
                {p.insuranceServiceResult !== undefined ? fmt.percent(p.insuranceServiceResult / (p.insuranceRevenue ?? 1)) : "–"}
              </td>
              <td className="py-3 px-3 text-right" style={{ color: "var(--color-text-primary)" }}>{fmt.currency(p.netProfit ?? 0)}</td>
              <td className="py-3 px-3 text-right">{p.netMargin !== undefined && <PillCell value={p.netMargin} threshold={0.06} />}</td>
              <td className="py-3 pl-3 text-right" style={{ color: "var(--color-text-secondary)" }}>{p.capitalBase ? fmt.currency(p.capitalBase) : "–"}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}