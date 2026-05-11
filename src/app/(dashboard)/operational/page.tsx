import { KpiHero } from "@/components/kpi/kpi-hero"
import { KpiTile } from "@/components/kpi/kpi-tile"
import { KpiStrip } from "@/components/kpi/kpi-strip"
import { Card } from "@/components/layout/card"
import { SectionHeader } from "@/components/layout/section-header"
import { SpecialtyTreemap } from "@/components/charts/specialty-treemap"
import { GapFlow } from "@/components/charts/gap-flow"
import { StateSpecialtyHeatmap } from "@/components/charts/state-specialty-heatmap"
import { StoryFrame } from "@/components/story/story-frame"
import { NarrativeBeat } from "@/components/story/beat"
import { getOperationalData } from "@/lib/data/loaders"
import { fmt } from "@/lib/format"

export default async function OperationalPage() {
  const data = await getOperationalData()

  // Sparklines from period series
  const labels = data.periods.map((p) => p.periodLabel)
  const benefitsSpark = data.periods.map((p) => p.totalBenefits)

  // Period deltas
  const latest = data.periods.at(-1)!
  const prior = data.periods.at(-2) ?? null
  const yearAgo = data.periods.at(-5) ?? null

  const benefitsQoQ = prior
    ? (latest.totalBenefits - prior.totalBenefits) / prior.totalBenefits
    : 0
  const benefitsYoY = yearAgo
    ? (latest.totalBenefits - yearAgo.totalBenefits) / yearAgo.totalBenefits
    : 0

  const fastestGrowing = [...data.specialties].sort((a, b) => b.yoyChange - a.yoyChange)[0]
  const largest = data.specialties[0]

  // Headline
  const headline = {
    status: data.gap.gapPct > 0.18 ? "watch" : ("healthy" as "healthy" | "watch" | "action"),
    statusLabel: data.gap.gapPct > 0.18 ? "Watch" : "Healthy",
    sentence: `Funds paid ${fmt.currency(data.gap.fundBenefits)} in medical benefits across ${fmt.number(data.gap.totalServices)} services this quarter, with ${fmt.percent(data.gap.gapPct)} of fees flowing through to patients as out-of-pocket costs.`,
    period: latest.periodLabel,
  }

  const exploreView = (
    <div className="space-y-4">
      {/* Row 1 — Headline */}
      <KpiHero headline={headline} />

      {/* Row 2 — KPI strip */}
      <KpiStrip>
        <KpiTile
          id="op-benefits"
          label="Fund benefits paid"
          rawValue={latest.totalBenefits}
          format="currency"
          delta={{ value: benefitsYoY }}
          sparklineValues={benefitsSpark}
          sparklineLabels={labels}
          subtext={`${fmt.percent(Math.abs(benefitsQoQ))} ${benefitsQoQ > 0 ? "increase" : "decrease"} on prior quarter.`}
          emphasis
        />
        <KpiTile
          id="op-services"
          label="Total services"
          rawValue={data.gap.totalServices}
          format="number"
          subtext="Medical services with fund benefit claims this quarter."
        />
        <KpiTile
          id="op-avg"
          label="Avg benefit per service"
          rawValue={data.gap.avgBenefitPerService}
          format="currency"
          subtext="Average fund payment per medical service rendered."
        />
        <KpiTile
          id="op-gap"
          label="Patient gap"
          rawValue={data.gap.gapPct * 100}
          format="pp"
          subtext={`${fmt.currency(data.gap.patientOutOfPocket)} out-of-pocket — politically watched metric.`}
          inverse
        />
        <KpiTile
          id="op-fastest"
          label="Fastest-growing"
          rawValue={fastestGrowing.yoyChange * 100}
          format="pp"
          subtext={`${fastestGrowing.specialty} — ${fmt.currency(fastestGrowing.benefitsPaid)} paid this quarter.`}
        />
      </KpiStrip>

      {/* Row 3 — Specialty treemap (HERO) */}
      <Card>
        <SectionHeader
          title="Benefits paid by specialty"
          subtitle="Tile size shows volume; colour shows year-on-year change. Largest tile is the dominant cost category."
        />
        <div className="flex items-center gap-4 text-caption text-text-secondary mt-3 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-positive" /> Stable / declining
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-chart-1" /> Moderate growth
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-warning" /> Elevated growth
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-negative" /> Rapid growth (10%+ YoY)
          </div>
        </div>
        <SpecialtyTreemap specialties={data.specialties.slice(0, 12)} />
        <p className="text-caption text-text-tertiary mt-4">
          {largest.specialty} dominates spending at {fmt.currency(largest.benefitsPaid)}, reflecting its near-universal involvement in surgical procedures. {fastestGrowing.specialty} is the fastest-growing category at {fmt.percent(fastestGrowing.yoyChange)} year-on-year.
        </p>
      </Card>

      {/* Row 4 — Gap flow + cost dynamics */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-12 lg:col-span-6">
          <SectionHeader
            title="Where the medical fee dollar goes"
            subtitle="Decomposition of total medical fees this quarter — split across insurance, Medicare, and patient out-of-pocket."
          />
          <div className="mt-5">
            <GapFlow
              totalFees={data.gap.totalFees}
              fundBenefits={data.gap.fundBenefits}
              medicareBenefits={data.gap.medicareBenefits}
              patientOutOfPocket={data.gap.patientOutOfPocket}
            />
          </div>
          <p className="text-caption text-text-tertiary mt-5">
            Around {fmt.percent(data.gap.gapPct)} of medical fees are paid by patients out-of-pocket — a politically sensitive metric and a key affordability indicator for the industry.
          </p>
        </Card>

        <Card className="col-span-12 lg:col-span-6">
          <SectionHeader
            title="Top specialty growth rates"
            subtitle="Year-on-year change in benefits paid, top 6 specialties by spend."
          />
          <div className="mt-4 space-y-3">
  {(() => {
    const top6 = data.specialties.slice(0, 6)
    const maxGrowth = Math.max(...top6.map((s) => Math.abs(s.yoyChange))) || 1
    return top6.map((spec) => {
      const isPositiveGrowth = spec.yoyChange > 0
      const intensity = Math.abs(spec.yoyChange) / maxGrowth
      return (
        <div key={spec.specialty} className="flex items-center gap-3">
          <span className="text-body-sm w-44 flex-shrink-0">{spec.specialty}</span>
          <div className="relative flex-1 h-1 bg-subtle rounded-full">
            <div
              className="absolute inset-y-0 rounded-full"
              style={{
                background: spec.yoyChange > 0.08
                  ? "var(--color-warning)"
                  : "var(--color-chart-1)",
                width: `${intensity * 100}%`,
                opacity: 0.7,
              }}
            />
          </div>
          <span className="text-body-sm tabular w-14 text-right">
            {isPositiveGrowth ? "+" : ""}
            {fmt.percent(spec.yoyChange)}
          </span>
        </div>
      )
    })
  })()}
</div>
          <p className="text-caption text-text-tertiary mt-5">
            Diagnostic and pathology categories show the highest growth — typically driven by demographic shifts and new test types entering the schedule.
          </p>
        </Card>
      </div>

      {/* Row 5 — State × specialty heatmap */}
      <Card>
        <SectionHeader
          title="Benefits paid by state and specialty"
          subtitle="Top 8 specialties × all states. Cell intensity shows benefit volume."
        />
        <div className="mt-6">
          <StateSpecialtyHeatmap rows={data.heatmap} specialties={data.topSpecialtiesForHeatmap} />
        </div>
      </Card>

      {/* Row 6 — Detail table */}
      <Card>
        <SectionHeader
          title="All specialties"
          subtitle="Full breakdown, sorted by benefits paid."
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-body-sm tabular">
            <thead>
              <tr className="border-b border-border-subtle text-text-secondary text-caption">
                <th className="text-left font-normal py-2 pr-4">Specialty</th>
                <th className="text-right font-normal py-2 px-4">Benefits paid</th>
                <th className="text-right font-normal py-2 px-4">Prior year</th>
                <th className="text-right font-normal py-2 pl-4">YoY change</th>
              </tr>
            </thead>
            <tbody>
              {data.specialties.map((s) => (
                <tr
                  key={s.specialty}
                  className="border-b border-border-subtle last:border-b-0 hover:bg-subtle transition-colors"
                >
                  <td className="py-2.5 pr-4">{s.specialty}</td>
                  <td className="py-2.5 px-4 text-right">{fmt.currency(s.benefitsPaid)}</td>
                  <td className="py-2.5 px-4 text-right">{fmt.currency(s.priorYearBenefits)}</td>
                  <td
                    className={`py-2.5 pl-4 text-right ${s.yoyChange > 0.08 ? "text-warning" : ""}`}
                  >
                    {s.yoyChange > 0 ? "+" : ""}
                    {fmt.percent(s.yoyChange)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )

  const storyView = (
    <div className="py-8">
      <div className="text-caption uppercase tracking-wider text-text-tertiary mb-3">
        Story · Operational performance
      </div>
      <h1 className="text-display leading-tight mb-6 max-w-3xl">
        Where the money flows, and the pressure points it reveals.
      </h1>
      <p className="text-body text-text-secondary leading-relaxed max-w-2xl mb-12">
        A detailed narrative walkthrough of {latest.periodLabel} claims activity is coming soon.
        In the meantime, the dashboard view remains fully interactive — toggle Story Mode off
        in the app bar to explore the data freely.
      </p>
      <NarrativeBeat
        eyebrow="Headline result"
        claim={headline.sentence}
        body={
          <p>
            The detailed breakdown by specialty, state, and gap composition is explored in the standard dashboard view.
            Toggle Story Mode off in the app bar to return to the full layout.
          </p>
        }
        visual={<KpiHero headline={headline} />}
        fullWidth
      />
    </div>
  )

  return <StoryFrame story={storyView} explore={exploreView} />
}