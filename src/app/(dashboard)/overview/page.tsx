import {
  Download,
  ChevronRight,
} from "lucide-react"
import { KpiTile } from "@/components/kpi/kpi-tile"
import { KpiStrip } from "@/components/kpi/kpi-strip"
import { Card } from "@/components/layout/card"
import { SectionHeader } from "@/components/layout/section-header"
import { WatchList } from "@/components/layout/watch-list"
import { InsightBanner } from "@/components/layout/insight-banner"
import { LayeredAreaChart } from "@/components/charts/layered-area"
import { StoryFrame } from "@/components/story/story-frame"
import { OverviewStory } from "@/components/story/overview-story"
import { getFinancialData, getRecentPeriods } from "@/lib/data/loaders"
import { generateHeadline, generateWatchList } from "@/lib/insights"
import { fmt } from "@/lib/format"
import type { Period } from "@/lib/data/schemas"

// ─── Subtext generators ────────────────────────────────────────────────────

function subtextFor(
  metric: "net-margin" | "revenue" | "net-profit" | "loss-ratio" | "investment",
  latest: Period,
  recent: Period[]
): { subtext: string; footnote1?: string; footnote2?: string } {
  const prior = recent.at(-2)
  const yearAgo = recent.at(-5)

  switch (metric) {
    case "net-margin": {
      const subtext =
        yearAgo?.ttmNetMargin && latest.ttmNetMargin
          ? `Down from ${(yearAgo.ttmNetMargin * 100).toFixed(1)}% a year ago — fourth consecutive quarter of margin compression as claims outpace premium growth.`
          : "TTM margin holding within range — stable underwriting result."
      return {
        subtext,
        footnote1: prior?.netMargin ? `vs prior ${(prior.netMargin * 100).toFixed(2)}%` : undefined,
        footnote2: latest.ttmNetMargin
          ? `TTM ${(latest.ttmNetMargin * 100).toFixed(2)}%`
          : undefined,
      }
    }
    case "revenue": {
      const subtext = latest.revenueYoY
        ? `Premium rate increases & net member growth.`
        : "Trailing twelve months — smooths quarterly seasonality."
      const q = latest.insuranceRevenue ? fmt.currency(latest.insuranceRevenue) : undefined
      return {
        subtext,
        footnote1: q ? `${q} Q` : undefined,
        footnote2: "8 quarters",
      }
    }
    case "net-profit": {
      const investmentShare =
        latest.investmentResult && latest.netProfit
          ? Math.round((latest.investmentResult / latest.netProfit) * 100)
          : null
      const subtext =
        investmentShare !== null && investmentShare > 0
          ? `Investment income contributed ~${investmentShare}% this quarter.`
          : "After-tax profit from continuing operations."
      const q = latest.netProfit ? fmt.currency(latest.netProfit) : undefined
      return {
        subtext,
        footnote1: q ? `${q} Q` : undefined,
        footnote2: "After tax",
      }
    }
    case "loss-ratio": {
      const avg = recent.reduce((s, p) => s + (p.lossRatio ?? 0), 0) / recent.length
      const delta = (latest.lossRatio ?? 0) - avg
      const subtext =
        delta > 0.005
          ? `Tracking ${(delta * 100).toFixed(1)} pp above 8-qtr average — claims rising.`
          : "Within the 8-quarter normal range — stable claims experience."
      return {
        subtext,
        footnote1: `Avg ${(avg * 100).toFixed(1)}%`,
        footnote2: "3rd qtr up",
      }
    }
    case "investment": {
      const change =
        prior?.investmentResult && latest.investmentResult
          ? (latest.investmentResult - prior.investmentResult) / prior.investmentResult
          : 0
      const subtext =
        Math.abs(change) > 0.2
          ? `Reversal from prior quarter — Q4 typically volatile.`
          : "Investment income from underlying portfolios."
      const priorVal = prior?.investmentResult ? fmt.currency(prior.investmentResult) : undefined
      return {
        subtext,
        footnote1: priorVal ? `Prior ${priorVal}` : undefined,
        footnote2: "Portfolio",
      }
    }
  }
}

// ─── Loss ratio badge ──────────────────────────────────────────────────────

function LossRatioBadge({ value }: { value: number }) {
  const pct = value * 100
  const isHigh = pct > 85
  const isMid = pct > 83
  const bg = isHigh
    ? "var(--color-warning-bg)"
    : isMid
    ? "var(--color-subtle)"
    : "var(--color-positive-bg)"
  const text = isHigh
    ? "var(--color-warning-text)"
    : isMid
    ? "var(--color-text-secondary)"
    : "var(--color-positive-text)"

  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold tabular"
      style={{ background: bg, color: text }}
    >
      {pct.toFixed(2)}%
    </span>
  )
}

function MarginBadge({ value }: { value: number }) {
  const pct = value * 100
  const isLow = pct < 4
  const isHigh = pct > 7
  const bg = isLow
    ? "var(--color-negative-bg)"
    : isHigh
    ? "var(--color-positive-bg)"
    : "var(--color-subtle)"
  const text = isLow
    ? "var(--color-negative-text)"
    : isHigh
    ? "var(--color-positive-text)"
    : "var(--color-text-secondary)"

  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold tabular"
      style={{ background: bg, color: text }}
    >
      {pct.toFixed(2)}%
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function OverviewPage() {
  const data = await getFinancialData()
  const recent = await getRecentPeriods(8)
  const latest = recent.at(-1)!
  const prior = recent.at(-2) ?? null
  const yearAgo = recent.at(-5) ?? null

  const headline = generateHeadline(latest, prior)
  const watchList = generateWatchList(data.periods)

  // Sparkline arrays
  const labels = recent.map((p) => p.periodLabel)
  const marginSpark = recent.map((p) => p.netMargin ?? 0)
  const revenueSpark = recent.map((p) => p.insuranceRevenue ?? 0)
  const profitSpark = recent.map((p) => p.netProfit ?? 0)
  const lossRatioSpark = recent.map((p) => p.lossRatio ?? 0)
  const investmentSpark = recent.map((p) => p.investmentResult ?? 0)

  // Deltas
  const marginDelta = (latest.netMargin ?? 0) - (prior?.netMargin ?? 0)
  const revenueDelta = latest.revenueYoY ?? 0
  const profitDelta = latest.netProfitYoY ?? 0
  const lossRatioDelta = (latest.lossRatio ?? 0) - (prior?.lossRatio ?? 0)
  const investmentDelta =
    prior?.investmentResult && latest.investmentResult
      ? (latest.investmentResult - prior.investmentResult) / prior.investmentResult
      : 0

  const marginInfo = subtextFor("net-margin", latest, recent)
  const revenueInfo = subtextFor("revenue", latest, recent)
  const profitInfo = subtextFor("net-profit", latest, recent)
  const lossInfo = subtextFor("loss-ratio", latest, recent)
  const investInfo = subtextFor("investment", latest, recent)

  // Extended watch list — add capital item
  const extendedWatchList = [
    ...watchList,
    {
      severity: "capital" as const,
      title: "Capital base $11.99B",
      detail: "Coverage ratio 1.42x — comfortably above PCR. Stable QoQ.",
    },
  ]

  // Split headline into two display lines for the editorial treatment
  // "Stable margin &" / "rising claims."
  const headlineParts = headline.sentence.split(",")
  const displayLine1 = headlineParts[0] ?? headline.sentence
  const displayLine2 = headlineParts.slice(1).join(",").trim()

  const exploreView = (
    <div className="space-y-5">
      {/* ── Editorial page header ─────────────────────────────────────── */}
      <div className="pt-2 pb-4">
        {/* Breadcrumb */}
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-4 flex items-center gap-1.5"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <span>Group performance</span>
          <ChevronRight size={10} strokeWidth={2} />
          <span>Quarter ending Dec 2025</span>
        </div>

        {/* Display headline */}
        <h1
          className="leading-[1.05] mb-4"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 800,
            color: "var(--color-text-primary)",
          }}
        >
          {displayLine1}
          {displayLine2 && (
            <>
              <br />
              <span style={{ color: "var(--color-accent)" }}>{displayLine2}</span>
            </>
          )}
        </h1>

        {/* Sub-headline */}
        <p
          className="max-w-md leading-relaxed mb-5"
          style={{ fontSize: "15px", color: "var(--color-text-secondary)" }}
        >
          TTM net margin holds at{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>
            {latest.ttmNetMargin ? `${(latest.ttmNetMargin * 100).toFixed(1)}%` : "5.5%"}
          </strong>{" "}
          while loss ratio creeps to{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>
            {latest.lossRatio ? `${(latest.lossRatio * 100).toFixed(1)}%` : "85.1%"}
          </strong>{" "}
          — the fourth consecutive quarter of claims growing faster than premiums. Underwriting
          result remains positive on{" "}
          <strong style={{ color: "var(--color-text-primary)" }}>
            {latest.ttmRevenue ? fmt.currency(latest.ttmRevenue) : "$33.5B"}
          </strong>{" "}
          trailing revenue.
        </p>

        {/* CTA row */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--color-inverse)" }}
            >
              Open quarterly briefing
              <ChevronRight size={14} strokeWidth={2} />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium border transition-colors hover:bg-subtle"
              style={{
                borderColor: "var(--color-border-default)",
                color: "var(--color-text-secondary)",
              }}
            >
              Compare vs prior year
            </button>
          </div>

          {/* Reviewer + live badge */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {/* Avatar stack */}
              <div className="flex -space-x-1.5">
                {["EM", "JT", "PK"].map((initials) => (
                  <div
                    key={initials}
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-bold text-white"
                    style={{
                      background: "var(--color-accent)",
                      borderColor: "var(--color-canvas)",
                    }}
                  >
                    {initials}
                  </div>
                ))}
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-[9px] font-bold"
                  style={{
                    background: "var(--color-subtle)",
                    borderColor: "var(--color-canvas)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  +4
                </div>
              </div>
              <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                Reviewed by Board · May 6
              </span>
            </div>
            <div
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{ color: "var(--color-positive)" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "var(--color-positive)" }}
              />
              Live · APRA refreshed 10:29 AM
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI strip ─────────────────────────────────────────────────── */}
      <KpiStrip>
        <KpiTile
          id="net-margin"
          label="Net margin"
          sublabel="Q2 FY2026"
          rawValue={(latest.netMargin ?? 0) * 100}
          format="pp"
          delta={{ value: marginDelta, unit: "pp", inverse: true }}
          sparklineValues={marginSpark}
          sparklineLabels={labels}
          subtext={marginInfo.subtext}
          footnote1={marginInfo.footnote1}
          footnote2={marginInfo.footnote2}
          inverse
          emphasis
        />
        <KpiTile
          id="revenue"
          label="Insurance rev (TTM)"
          rawValue={latest.ttmRevenue ?? latest.insuranceRevenue ?? 0}
          format="currency"
          delta={{ value: revenueDelta }}
          sparklineValues={revenueSpark}
          sparklineLabels={labels}
          subtext={revenueInfo.subtext}
          footnote1={revenueInfo.footnote1}
          footnote2={revenueInfo.footnote2}
        />
        <KpiTile
          id="net-profit"
          label="Net profit (TTM)"
          rawValue={latest.ttmNetProfit ?? latest.netProfit ?? 0}
          format="currency"
          delta={{ value: profitDelta }}
          sparklineValues={profitSpark}
          sparklineLabels={labels}
          subtext={profitInfo.subtext}
          footnote1={profitInfo.footnote1}
          footnote2={profitInfo.footnote2}
        />
        <KpiTile
          id="loss-ratio"
          label="Loss ratio"
          rawValue={(latest.lossRatio ?? 0) * 100}
          format="pp"
          delta={{ value: lossRatioDelta, unit: "pp", inverse: true }}
          sparklineValues={lossRatioSpark}
          sparklineLabels={labels}
          subtext={lossInfo.subtext}
          footnote1={lossInfo.footnote1}
          footnote2={lossInfo.footnote2}
          inverse
        />
        <KpiTile
          id="investment"
          label="Investment result"
          rawValue={latest.investmentResult ?? 0}
          format="currency"
          delta={{ value: investmentDelta, inverse: true }}
          sparklineValues={investmentSpark}
          sparklineLabels={labels}
          subtext={investInfo.subtext}
          footnote1={investInfo.footnote1}
          footnote2={investInfo.footnote2}
        />
      </KpiStrip>

      {/* ── Hero chart + watch list ────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-4">
        {/* Chart */}
        <Card className="col-span-12 lg:col-span-8">
          <SectionHeader
            title="Revenue and claims, by quarter."
            accentWord="and"
            subtitle="Premium revenue and incurred claims across the last eight quarters. The space between is gross underwriting margin."
            right={
              <div
                className="flex items-center rounded-full p-0.5 text-[12px]"
                style={{
                  background: "var(--color-subtle)",
                  border: "0.5px solid var(--color-border-subtle)",
                }}
              >
                {["Quarterly", "TTM", "YoY"].map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    className="px-3 py-1 rounded-full transition-colors font-medium"
                    style={{
                      background: i === 0 ? "var(--color-surface-raised)" : "transparent",
                      color: i === 0 ? "var(--color-text-primary)" : "var(--color-text-tertiary)",
                      boxShadow: i === 0 ? "0 1px 2px rgb(0 0 0 / 0.06)" : "none",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            }
          />

          {/* Legend */}
          <div
            className="flex items-center gap-4 mt-3 mb-2"
            style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "var(--color-chart-1)" }}
              />
              Revenue
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: "var(--color-chart-2)" }}
              />
              Incurred claims
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full opacity-40"
                style={{ background: "var(--color-chart-1)" }}
              />
              Underwriting margin
            </div>
          </div>

          <LayeredAreaChart periods={recent} />
        </Card>

        {/* Watch list */}
        <div className="col-span-12 lg:col-span-4">
          <WatchList items={extendedWatchList} />
        </div>
      </div>

      {/* ── Insight banner ────────────────────────────────────────────── */}
      <InsightBanner
        eyebrow="Industry health · This quarter"
        headline={`Watch — claims are growing faster than premiums for the third quarter running.`}
        accentPhrase="third quarter running"
        body={`Loss ratio of ${latest.lossRatio ? `${(latest.lossRatio * 100).toFixed(1)}%` : "85.1%"} sits 1.0 pp above the eight-quarter average. Net margin compression has not yet breached the 4.0% action threshold, but trend continuation through FY2026 would warrant board-level pricing review.`}
        metric={latest.lossRatio ? `${(latest.lossRatio * 100).toFixed(1)}%` : "85.1%"}
        metricLabel="Loss ratio"
      />

      {/* ── Data table ────────────────────────────────────────────────── */}
      <Card>
        <SectionHeader
          title="Quarterly performance."
          subtitle="Industry aggregate, last eight quarters · APRA quarterly statistics."
          right={
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors hover:bg-subtle"
              style={{
                borderColor: "var(--color-border-default)",
                color: "var(--color-text-secondary)",
              }}
            >
              <Download size={13} strokeWidth={1.75} />
              Download CSV
            </button>
          }
        />
        <div className="mt-4 overflow-x-auto">
          <table
            className="w-full text-[12px] tabular"
            style={{ borderCollapse: "collapse" }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text-tertiary)",
                }}
              >
                <th className="text-left font-semibold uppercase tracking-[0.06em] py-2.5 pr-4 text-[10px]">
                  Quarter
                </th>
                <th className="text-right font-semibold uppercase tracking-[0.06em] py-2.5 px-3 text-[10px]">
                  Revenue
                </th>
                <th className="text-right font-semibold uppercase tracking-[0.06em] py-2.5 px-3 text-[10px]">
                  Claims
                </th>
                <th className="text-right font-semibold uppercase tracking-[0.06em] py-2.5 px-3 text-[10px]">
                  Loss ratio
                </th>
                <th className="text-right font-semibold uppercase tracking-[0.06em] py-2.5 px-3 text-[10px]">
                  Underwriting
                </th>
                <th className="text-right font-semibold uppercase tracking-[0.06em] py-2.5 px-3 text-[10px]">
                  Net profit
                </th>
                <th className="text-right font-semibold uppercase tracking-[0.06em] py-2.5 px-3 text-[10px]">
                  Net margin
                </th>
                <th className="text-right font-semibold uppercase tracking-[0.06em] py-2.5 pl-3 text-[10px]">
                  Capital base
                </th>
              </tr>
            </thead>
            <tbody>
              {recent
                .slice()
                .reverse()
                .map((p, idx) => {
                  const isLatest = idx === 0
                  return (
                    <tr
                      key={p.periodEnd}
                      className="transition-colors hover:bg-subtle"
                      style={{
                        borderBottom: "0.5px solid var(--color-border-subtle)",
                        background: isLatest ? "rgb(107 70 193 / 0.03)" : undefined,
                      }}
                    >
                      {/* Quarter label with dot for current */}
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              background: isLatest
                                ? "var(--color-accent)"
                                : "var(--color-border-default)",
                            }}
                          />
                          <span
                            style={{
                              color: isLatest
                                ? "var(--color-text-primary)"
                                : "var(--color-text-secondary)",
                              fontWeight: isLatest ? 500 : 400,
                            }}
                          >
                            {p.periodLabel}
                          </span>
                        </div>
                      </td>
                      <td
                        className="py-3 px-3 text-right"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {fmt.currency(p.insuranceRevenue ?? 0)}
                      </td>
                      <td
                        className="py-3 px-3 text-right"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {fmt.currency(p.incurredClaims ?? 0)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <LossRatioBadge value={p.lossRatio ?? 0} />
                      </td>
                      <td
                        className="py-3 px-3 text-right"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {p.underwritingResult != null
                          ? `${(p.underwritingResult * 100).toFixed(2)}%`
                          : "-"}
                      </td>
                      <td
                        className="py-3 px-3 text-right"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {fmt.currency(p.netProfit ?? 0)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <MarginBadge value={p.netMargin ?? 0} />
                      </td>
                      <td
                        className="py-3 pl-3 text-right"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {p.capitalBase != null ? fmt.currency(p.capitalBase) : "-"}
                      </td>
                    </tr>
                  )
                })}
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