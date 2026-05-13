import { KpiHero } from "@/components/kpi/kpi-hero"
import { KpiTile } from "@/components/kpi/kpi-tile"
import { KpiStrip } from "@/components/kpi/kpi-strip"
import { SectionHeader } from "@/components/layout/section-header"
import { BulletChart } from "@/components/charts/bullet-chart"
import { WaterfallChart } from "@/components/charts/waterfall"
import { ProfitCompositionChart } from "@/components/charts/profit-composition"
import { StoryFrame } from "@/components/story/story-frame"
import { NarrativeBeat } from "@/components/story/beat"
import { Icon } from "@/components/icons/icon-defs"
import { getFinancialData, getRecentPeriods } from "@/lib/data/loaders"
import { buildBulletData, buildProfitComposition, buildRevenueWaterfall } from "@/lib/data/transforms"
import { fmt } from "@/lib/format"
import type { Period } from "@/lib/data/schemas"
import type { Headline } from "@/lib/insights"
import { RevenueSankey } from "@/components/charts/revenue-sankey"
import { getPeriodCount } from "@/lib/period-utils"

function generateFinancialHeadline(latest: Period, prior: Period | null, recent: Period[]): Headline {
  const margin = latest.netMargin ?? 0
  const lossRatio = latest.lossRatio ?? 0
  const priorMargin = prior?.netMargin ?? margin
  const marginDelta = margin - priorMargin
  const investmentShare = latest.investmentResult && latest.netProfit
    ? Math.round((latest.investmentResult / latest.netProfit) * 100) : 0

  let status: "healthy" | "watch" | "action" = "healthy"
  if (margin < 0.04 || lossRatio > 0.88) status = "action"
  else if (margin < 0.06 || lossRatio > 0.85) status = "watch"

  const part1 = marginDelta > 0.005 ? "Expanding profit" : marginDelta < -0.008 ? "Compressing profit" : "Stable profit"
  const part2 = investmentShare > 35 ? "investment-driven" : lossRatio > 0.86 ? "claims pressure" : "underwriting-led"
  const part2Status: "healthy" | "watch" | "action" = lossRatio > 0.86 ? "watch" : "healthy"

  const sentence = investmentShare > 30
    ? `Net profit of ${fmt.currency(latest.netProfit ?? 0)} reflects ${fmt.percent(margin)} margin on ${fmt.currency(latest.insuranceRevenue ?? 0)} revenue, with investment income contributing ~${investmentShare}% of bottom-line earnings.`
    : `Net profit of ${fmt.currency(latest.netProfit ?? 0)} reflects ${fmt.percent(margin)} margin on ${fmt.currency(latest.insuranceRevenue ?? 0)} revenue, driven primarily by underwriting result.`

  const signals = [
    {
      label: "Net margin",
      value: fmt.percent(margin),
      delta: `${marginDelta > 0 ? "+" : ""}${(marginDelta * 100).toFixed(2)}pp QoQ`,
      trend: (marginDelta > 0.001 ? "up" : marginDelta < -0.001 ? "down" : "flat") as "up" | "down" | "flat",
      inverse: false,
    },
    {
      label: "Net profit",
      value: fmt.currency(latest.netProfit ?? 0),
      delta: latest.netProfitYoY ? `${latest.netProfitYoY > 0 ? "+" : ""}${fmt.percent(Math.abs(latest.netProfitYoY))} YoY` : undefined,
      trend: ((latest.netProfitYoY ?? 0) > 0 ? "up" : "down") as "up" | "down" | "flat",
      inverse: false,
    },
    {
      label: "Loss ratio",
      value: fmt.percent(lossRatio),
      delta: prior?.lossRatio ? `${lossRatio > prior.lossRatio ? "+" : ""}${((lossRatio - prior.lossRatio) * 100).toFixed(2)}pp QoQ` : undefined,
      trend: (lossRatio > (prior?.lossRatio ?? lossRatio) ? "up" : "down") as "up" | "down" | "flat",
      inverse: true,
    },
  ]

  return {
    status,
    statusLabel: status === "healthy" ? "Healthy" : status === "watch" ? "Watch" : "Action",
    part1,
    part2,
    part2Status,
    sentence,
    signals,
    period: latest.periodLabel,
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

export default async function FinancialPage({
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

  const headline = generateFinancialHeadline(latest, prior, recent)
  const bullets = buildBulletData(data.periods)
  const profitData = buildProfitComposition(recent)
  const waterfall = prior ? buildRevenueWaterfall(latest, prior) : []

  const labels = recent.map((p) => p.periodLabel)
  const revenueSpark = recent.map((p) => p.insuranceRevenue ?? 0)
  const profitSpark = recent.map((p) => p.netProfit ?? 0)
  const lossRatioSpark = recent.map((p) => p.lossRatio ?? 0)
  const marginSpark = recent.map((p) => p.netMargin ?? 0)
  const investmentSpark = recent.map((p) => p.investmentResult ?? 0)

  const marginDelta = (latest.netMargin ?? 0) - (prior?.netMargin ?? 0)
  const lossDelta = (latest.lossRatio ?? 0) - (prior?.lossRatio ?? 0)
  const revenueDelta = latest.revenueYoY ?? 0
  const profitDelta = latest.netProfitYoY ?? 0
  const investmentDelta = prior?.investmentResult && latest.investmentResult
    ? (latest.investmentResult - prior.investmentResult) / prior.investmentResult : 0

  const exploreView = (
    <div className="space-y-5">
      <KpiHero headline={headline} />

      <KpiStrip>
        <KpiTile id="fin-revenue" label="Insurance revenue (TTM)"
          rawValue={latest.ttmRevenue ?? latest.insuranceRevenue ?? 0} format="currency"
          delta={{ value: revenueDelta }}
          sparklineValues={revenueSpark} sparklineLabels={labels}
          subtext={`${fmt.percent(Math.abs(revenueDelta))} ${revenueDelta > 0 ? "growth" : "decline"} reflects rate increases and net member changes.`}
          footnote={[latest.insuranceRevenue ? `${fmt.currency(latest.insuranceRevenue)} Q` : "", "8 quarters"]}
          tint="deep" labelIcon="coin" cornerIcon="trend-up" />
        <KpiTile id="fin-profit" label="Net profit (TTM)"
          rawValue={latest.ttmNetProfit ?? latest.netProfit ?? 0} format="currency"
          delta={{ value: profitDelta }}
          sparklineValues={profitSpark} sparklineLabels={labels}
          subtext={profitDelta > 0 ? "Year-on-year profit recovering." : "Year-on-year profit compressed."}
          footnote={[latest.netProfit ? `${fmt.currency(latest.netProfit)} Q` : "", "After tax"]}
          labelIcon="bar-chart" cornerIcon={profitDelta >= 0 ? "trend-up" : "trend-down"} />
        <KpiTile id="fin-margin" label="Net margin"
          rawValue={(latest.netMargin ?? 0) * 100} format="pp"
          delta={{ value: marginDelta, unit: "pp" }}
          sparklineValues={marginSpark} sparklineLabels={labels}
          subtext="Net profit as a share of insurance revenue."
          footnote={[prior?.netMargin ? `Prior ${fmt.percent(prior.netMargin)}` : "", "QoQ"]}
          labelIcon="pct" cornerIcon="activity" />
        <KpiTile id="fin-loss" label="Loss ratio"
          rawValue={(latest.lossRatio ?? 0) * 100} format="pp"
          delta={{ value: lossDelta, unit: "pp", inverse: true }}
          sparklineValues={lossRatioSpark} sparklineLabels={labels}
          subtext="Claims as a share of revenue. Lower is better."
          footnote={["Avg 84.0%", "8-qtr avg"]}
          inverse tint="cream" labelIcon="stethoscope" cornerIcon="alert" />
        <KpiTile id="fin-investment" label="Investment result"
          rawValue={latest.investmentResult ?? 0} format="currency"
          delta={{ value: investmentDelta }}
          sparklineValues={investmentSpark} sparklineLabels={labels}
          subtext="Quarterly net investment income — historically volatile."
          footnote={[prior?.investmentResult ? `Prior ${fmt.currency(prior.investmentResult)}` : "", "Portfolio"]}
          labelIcon="spark" cornerIcon="activity" />
      </KpiStrip>

      {/* Performance vs target */}
      <div className="glass">
        <SectionHeader eyebrow="Performance" eyebrowIcon="activity"
          title="Performance against target."
          emphasis="against"
          subtitle="Each metric vs the 8-quarter rolling median. Black tick is target; coloured bar is actual." />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-5">
          {bullets.map((b) => <BulletChart key={b.label} data={b} />)}
        </div>
      </div>

      {/* ── Sankey: How premium becomes profit ── */}
      <div className="glass" style={{ overflow: "visible" }}>
        <SectionHeader
          eyebrow="Revenue flow"
          eyebrowIcon="coin"
          title="How premium becomes profit."
          emphasis="profit"
          subtitle={`Sankey flow of ${latest.periodLabel} revenue — from insurance premium through claims, underwriting, and investment to net profit.`}
        />
        <div className="mt-6">
          <RevenueSankey latest={latest} />
        </div>
        <div className="mt-4 flex flex-wrap gap-6 font-sans text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
          {[
            { label: "Premium revenue", color: "var(--color-bupa-navy)",  value: fmt.currency(latest.insuranceRevenue ?? 0) },
            { label: "Incurred claims", color: "var(--color-negative)",   value: fmt.currency(latest.incurredClaims ?? 0) },
            { label: "Underwriting result", color: "var(--color-bupa-blue)", value: fmt.currency(latest.insuranceServiceResult ?? 0) },
            { label: "Investment income", color: "var(--color-bupa-teal)", value: fmt.currency(latest.investmentResult ?? 0) },
            { label: "Net profit",       color: "var(--color-positive)",  value: fmt.currency(latest.netProfit ?? 0) },
          ].map(({ label, color, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color }} />
              <span style={{ color: "var(--color-text-tertiary)" }}>{label}</span>
              <span className="font-semibold tabular" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Waterfall + profit composition */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 glass" style={{ overflow: "visible" }}>
          <SectionHeader eyebrow="Revenue" eyebrowIcon="coin"
            title="Revenue decomposition."
            emphasis="decomposition"
            subtitle={`Period-over-period change in insurance revenue, ${prior?.periodLabel ?? ""} to ${latest.periodLabel}.`} />
          <WaterfallChart steps={waterfall} />
          <p className="font-sans text-[11px] mt-3" style={{ color: "var(--color-text-tertiary)" }}>
            Decomposition is approximate; rate vs volume split estimated at 70/30 based on industry convention.
          </p>
        </div>

        <div className="col-span-12 lg:col-span-4 glass">
          <SectionHeader eyebrow="Composition" eyebrowIcon="bar-chart"
            title="Profit composition."
            emphasis="composition"
            subtitle="Underwriting vs investment result, post-tax estimate." />
          <div className="flex items-center gap-4 mt-3 mb-2 font-sans text-[12px]"
            style={{ color: "var(--color-text-secondary)" }}>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-chart-1)" }} />
              Underwriting
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: "var(--color-chart-2)" }} />
              Investment
            </div>
          </div>
          <ProfitCompositionChart data={profitData} />
        </div>
      </div>

      {/* Detail table */}
      <div className="glass">
        <SectionHeader eyebrow="Detail" eyebrowIcon="doc"
          title="Quarterly financials."
          emphasis="financials"
          subtitle="Industry aggregate, last eight quarters."
          right={
            <button className="glass-strong inline-flex h-9 items-center gap-2 rounded-full px-4 font-sans text-[12px] font-medium"
              style={{ color: "var(--color-bupa-navy)" }}>
              <Icon name="download" size="sm" />Download CSV
            </button>
          } />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full font-sans text-[13px] tabular">
            <thead>
              <tr style={{ color: "var(--color-text-tertiary)", borderBottom: "1px solid var(--color-border-subtle)" }}>
                {["Quarter", "Revenue", "Claims", "Loss ratio", "Underwriting", "Investment", "Net profit", "Net margin"].map((h, i) => (
                  <th key={h} className={`py-3 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] ${i === 0 ? "text-left pr-4" : "text-right px-3"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.slice().reverse().map((p, idx) => {
                const isCurrent = idx === 0
                return (
                  <tr key={p.periodEnd} className="hover:bg-white/40 transition-colors"
                    style={{ borderBottom: "0.5px solid var(--color-border-subtle)" }}>
                    <td className="py-3 pr-4 font-sans text-[13px]" style={{ color: "var(--color-bupa-navy)", fontWeight: isCurrent ? 600 : 400 }}>
                      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                        style={{ background: isCurrent ? "var(--color-bupa-blue)" : "rgba(0,47,108,0.18)" }} />
                      {p.periodLabel}
                    </td>
                    <td className="py-3 px-3 text-right" style={{ color: "var(--color-text-primary)" }}>{fmt.currency(p.insuranceRevenue ?? 0)}</td>
                    <td className="py-3 px-3 text-right" style={{ color: "var(--color-text-primary)" }}>{fmt.currency(p.incurredClaims ?? 0)}</td>
                    <td className="py-3 px-3 text-right">{p.lossRatio !== undefined && <PillCell value={p.lossRatio} threshold={0.85} inverse />}</td>
                    <td className="py-3 px-3 text-right" style={{ color: "var(--color-text-secondary)" }}>{fmt.currency(p.insuranceServiceResult ?? 0)}</td>
                    <td className="py-3 px-3 text-right" style={{ color: "var(--color-text-secondary)" }}>{fmt.currency(p.investmentResult ?? 0)}</td>
                    <td className="py-3 px-3 text-right" style={{ color: "var(--color-text-primary)" }}>{fmt.currency(p.netProfit ?? 0)}</td>
                    <td className="py-3 pl-3 text-right">{p.netMargin !== undefined && <PillCell value={p.netMargin} threshold={0.06} />}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const storyView = (
    <div className="py-8">
      <div className="font-sans text-[11px] uppercase tracking-[0.2em] mb-3"
        style={{ color: "var(--color-text-tertiary)" }}>
        Story · Financial performance
      </div>
      <h1 className="font-sans font-bold mb-6 max-w-3xl"
        style={{ fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-0.03em", color: "var(--color-bupa-navy)" }}>
        How the financial engine is running.
      </h1>
      <p className="font-sans leading-relaxed max-w-2xl mb-12"
        style={{ fontSize: "16px", color: "var(--color-text-secondary)" }}>
        A detailed narrative walkthrough of {latest.periodLabel} financial performance is coming soon.
        Toggle Story Mode off to explore the data freely.
      </p>
      <NarrativeBeat
        eyebrow="Headline result"
        claim={headline.sentence}
        body={<p>The detailed numbers behind this result are explored in the standard dashboard view.</p>}
        visual={<KpiHero headline={headline} />}
        fullWidth
      />
    </div>
  )

  return <StoryFrame story={storyView} explore={exploreView} />
}