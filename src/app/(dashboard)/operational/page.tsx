import { KpiHero } from "@/components/kpi/kpi-hero"
import { KpiTile } from "@/components/kpi/kpi-tile"
import { KpiStrip } from "@/components/kpi/kpi-strip"
import { SectionHeader } from "@/components/layout/section-header"
import { SpecialtyTreemap } from "@/components/charts/specialty-treemap"
import { GapFlow } from "@/components/charts/gap-flow"
import { StateSpecialtyHeatmap } from "@/components/charts/state-specialty-heatmap"
import { StoryFrame } from "@/components/story/story-frame"
import { NarrativeBeat } from "@/components/story/beat"
import { Icon } from "@/components/icons/icon-defs"
import { getOperationalData } from "@/lib/data/loaders"
import { fmt } from "@/lib/format"
import type { Headline } from "@/lib/insights"

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

export default async function OperationalPage() {
  const data = await getOperationalData()

  const labels = data.periods.map((p) => p.periodLabel)
  const benefitsSpark = data.periods.map((p) => p.totalBenefits)

  const latest = data.periods.at(-1)!
  const prior = data.periods.at(-2) ?? null
  const yearAgo = data.periods.at(-5) ?? null

  const benefitsQoQ = prior
    ? (latest.totalBenefits - prior.totalBenefits) / prior.totalBenefits : 0
  const benefitsYoY = yearAgo
    ? (latest.totalBenefits - yearAgo.totalBenefits) / yearAgo.totalBenefits : 0

  const fastestGrowing = [...data.specialties].sort((a, b) => b.yoyChange - a.yoyChange)[0]
  const largest = data.specialties[0]

  const headline: Headline = {
    status: data.gap.gapPct > 0.18 ? "watch" : "healthy",
    statusLabel: data.gap.gapPct > 0.18 ? "Watch" : "Healthy",
    part1: data.gap.gapPct > 0.18 ? "Elevated patient gap" : "Stable claims flow",
    part2: fastestGrowing ? `${fastestGrowing.specialty.toLowerCase()} leading growth` : "benefits on track",
    part2Status: benefitsYoY > 0.08 ? "watch" : "healthy",
    sentence: `Funds paid ${fmt.currency(data.gap.fundBenefits)} in medical benefits across ${fmt.number(data.gap.totalServices)} services this quarter, with ${fmt.percent(data.gap.gapPct)} of fees flowing through to patients as out-of-pocket costs.`,
    signals: [
      {
        label: "Benefits paid",
        value: fmt.currency(latest.totalBenefits),
        delta: benefitsYoY ? `${benefitsYoY > 0 ? "+" : ""}${fmt.percent(Math.abs(benefitsYoY))} YoY` : undefined,
        trend: benefitsYoY > 0.005 ? "up" : benefitsYoY < -0.005 ? "down" : "flat",
        inverse: true,
      },
      {
        label: "Patient gap",
        value: fmt.percent(data.gap.gapPct),
        delta: undefined,
        trend: data.gap.gapPct > 0.18 ? "up" : "flat",
        inverse: true,
      },
      {
        label: "Fastest growing",
        value: fastestGrowing ? fastestGrowing.specialty : "–",
        delta: fastestGrowing ? `+${fmt.percent(fastestGrowing.yoyChange)} YoY` : undefined,
        trend: "up",
        inverse: true,
      },
    ],
    period: latest.periodLabel,
  }

  const exploreView = (
    <div className="space-y-5">
      <KpiHero headline={headline} />

      <KpiStrip>
        <KpiTile id="op-benefits" label="Fund benefits paid"
          rawValue={latest.totalBenefits} format="currency"
          delta={{ value: benefitsYoY }}
          sparklineValues={benefitsSpark} sparklineLabels={labels}
          subtext={`${fmt.percent(Math.abs(benefitsQoQ))} ${benefitsQoQ > 0 ? "increase" : "decrease"} on prior quarter.`}
          footnote={[prior ? `Prior ${fmt.currency(prior.totalBenefits)}` : "", "QoQ"]}
          tint="deep" labelIcon="coin" cornerIcon="activity" />
        <KpiTile id="op-services" label="Total services"
          rawValue={data.gap.totalServices} format="number"
          subtext="Medical services with fund benefit claims this quarter."
          footnote={[fmt.currency(data.gap.avgBenefitPerService) + " avg", "per service"]}
          labelIcon="stethoscope" cornerIcon="bar-chart" />
        <KpiTile id="op-avg" label="Avg benefit per service"
          rawValue={data.gap.avgBenefitPerService} format="currency"
          subtext="Average fund payment per medical service rendered."
          footnote={["Fund + Medicare", "combined"]}
          labelIcon="coin" cornerIcon="trend-up" />
        <KpiTile id="op-gap" label="Patient gap"
          rawValue={data.gap.gapPct * 100} format="pp"
          subtext={`${fmt.currency(data.gap.patientOutOfPocket)} out-of-pocket — politically watched metric.`}
          footnote={[fmt.currency(data.gap.patientOutOfPocket), "total OOP"]}
          inverse tint="cream" labelIcon="alert" cornerIcon="alert" />
        <KpiTile id="op-fastest" label="Fastest-growing specialty"
          rawValue={fastestGrowing ? fastestGrowing.yoyChange * 100 : 0} format="pp"
          subtext={fastestGrowing ? `${fastestGrowing.specialty} — ${fmt.currency(fastestGrowing.benefitsPaid)} paid this quarter.` : ""}
          footnote={[fastestGrowing?.specialty ?? "", "YoY growth"]}
          labelIcon="activity" cornerIcon="trend-up" />
      </KpiStrip>

      {/* Specialty treemap */}
      <div className="glass">
        <SectionHeader
          title="Benefits paid by specialty."
         
          subtitle="Tile size shows volume; colour shows year-on-year change. Largest tile is the dominant cost category." />
        <div className="flex flex-wrap items-center gap-4 mt-3 mb-3 font-sans text-[12px]"
          style={{ color: "var(--color-text-secondary)" }}>
          {[
            { label: "Stable / declining", color: "var(--color-positive)" },
            { label: "Moderate growth", color: "var(--color-chart-1)" },
            { label: "Elevated growth", color: "var(--color-warning)" },
            { label: "Rapid growth (10%+ YoY)", color: "var(--color-negative)" },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
        <SpecialtyTreemap specialties={data.specialties.slice(0, 12)} />
        <p className="font-sans text-[12px] mt-4" style={{ color: "var(--color-text-tertiary)" }}>
          {largest.specialty} dominates spending at {fmt.currency(largest.benefitsPaid)}, reflecting its near-universal involvement in surgical procedures. {fastestGrowing.specialty} is the fastest-growing category at {fmt.percent(fastestGrowing.yoyChange)} year-on-year.
        </p>
      </div>

      {/* Gap flow + growth rates */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6 glass">
          <SectionHeader
            title="Where the medical fee dollar goes."
           
            subtitle="Split of total medical fees across insurance, Medicare, and patient out-of-pocket." />
          <div className="mt-5">
            <GapFlow
              totalFees={data.gap.totalFees}
              fundBenefits={data.gap.fundBenefits}
              medicareBenefits={data.gap.medicareBenefits}
              patientOutOfPocket={data.gap.patientOutOfPocket}
            />
          </div>
          <p className="font-sans text-[12px] mt-5" style={{ color: "var(--color-text-tertiary)" }}>
            Around {fmt.percent(data.gap.gapPct)} of medical fees are paid by patients out-of-pocket — a politically sensitive metric and key affordability indicator.
          </p>
        </div>

        <div className="col-span-12 lg:col-span-6 glass">
          <SectionHeader
            title="Top specialty growth rates."
           
            subtitle="Year-on-year change in benefits paid, top 6 specialties by spend." />
          <div className="mt-4 space-y-4">
            {(() => {
              const top6 = data.specialties.slice(0, 6)
              const maxGrowth = Math.max(...top6.map((s) => Math.abs(s.yoyChange))) || 1
              return top6.map((spec) => {
                const intensity = Math.abs(spec.yoyChange) / maxGrowth
                const barColor = spec.yoyChange > 0.08
                  ? "var(--color-warning)"
                  : spec.yoyChange > 0.05
                  ? "var(--color-bupa-blue)"
                  : "var(--color-positive)"
                return (
                  <div key={spec.specialty} className="flex items-center gap-3">
                    <span className="font-sans text-[13px] w-44 flex-shrink-0"
                      style={{ color: "var(--color-text-primary)" }}>
                      {spec.specialty}
                    </span>
                    <div className="relative flex-1 h-1.5 rounded-full"
                      style={{ background: "var(--color-subtle)" }}>
                      <div className="absolute inset-y-0 rounded-full transition-all"
                        style={{ background: barColor, width: `${intensity * 100}%` }} />
                    </div>
                    <span className="font-sans text-[12px] font-semibold tabular w-14 text-right"
                      style={{ color: spec.yoyChange > 0.08 ? "var(--color-warning)" : "var(--color-text-primary)" }}>
                      {spec.yoyChange > 0 ? "+" : ""}{fmt.percent(spec.yoyChange)}
                    </span>
                  </div>
                )
              })
            })()}
          </div>
          <p className="font-sans text-[12px] mt-5" style={{ color: "var(--color-text-tertiary)" }}>
            Diagnostic and pathology categories show the highest growth — driven by demographic shifts and new test types entering the schedule.
          </p>
        </div>
      </div>

      {/* State × specialty heatmap */}
      <div className="glass">
        <SectionHeader
          title="Benefits by state and specialty."
         
          subtitle="Top 8 specialties × all states. Cell intensity shows benefit volume." />
        <div className="mt-6">
          <StateSpecialtyHeatmap rows={data.heatmap} specialties={data.topSpecialtiesForHeatmap} />
        </div>
      </div>

      {/* Detail table */}
      <div className="glass">
        <SectionHeader
          title="All specialties."
         
          subtitle="Full breakdown, sorted by benefits paid."
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
                {["Specialty", "Benefits paid", "Prior year", "YoY change"].map((h, i) => (
                  <th key={h} className={`py-3 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] ${i === 0 ? "text-left pr-4" : "text-right px-3"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.specialties.map((s, idx) => (
                <tr key={s.specialty} className="hover:bg-white/40 transition-colors"
                  style={{ borderBottom: "0.5px solid var(--color-border-subtle)" }}>
                  <td className="py-3 pr-4 font-sans text-[13px]"
                    style={{ color: "var(--color-bupa-navy)", fontWeight: idx === 0 ? 600 : 400 }}>
                    {idx === 0 && (
                      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle"
                        style={{ background: "var(--color-bupa-blue)" }} />
                    )}
                    {s.specialty}
                  </td>
                  <td className="py-3 px-3 text-right" style={{ color: "var(--color-text-primary)" }}>
                    {fmt.currency(s.benefitsPaid)}
                  </td>
                  <td className="py-3 px-3 text-right" style={{ color: "var(--color-text-secondary)" }}>
                    {fmt.currency(s.priorYearBenefits)}
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <span className="font-semibold"
                      style={{ color: s.yoyChange > 0.08 ? "var(--color-warning)" : s.yoyChange > 0 ? "var(--color-positive)" : "var(--color-negative)" }}>
                      {s.yoyChange > 0 ? "+" : ""}{fmt.percent(s.yoyChange)}
                    </span>
                  </td>
                </tr>
              ))}
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
        Story · Operational performance
      </div>
      <h1 className="font-sans font-bold mb-6 max-w-3xl"
        style={{ fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-0.03em", color: "var(--color-bupa-navy)" }}>
        Where the money flows, and the pressure points it reveals.
      </h1>
      <p className="font-sans leading-relaxed max-w-2xl mb-12"
        style={{ fontSize: "16px", color: "var(--color-text-secondary)" }}>
        A detailed narrative walkthrough of {latest.periodLabel} claims activity is coming soon.
        Toggle Story Mode off to explore the data freely.
      </p>
      <NarrativeBeat
       
        claim={headline.sentence}
        body={<p>The detailed breakdown by specialty, state, and gap composition is explored in the standard dashboard view.</p>}
        visual={<KpiHero headline={headline} />}
        fullWidth
      />
    </div>
  )

  return <StoryFrame story={storyView} explore={exploreView} />
}