import { KpiHero } from "@/components/kpi/kpi-hero"
import { KpiTile } from "@/components/kpi/kpi-tile"
import { KpiStrip } from "@/components/kpi/kpi-strip"
import { SectionHeader } from "@/components/layout/section-header"
import { PopulationPyramid } from "@/components/charts/population-pyramid"
import { StateCoverageList } from "@/components/charts/state-coverage-list"
import { SegmentBars } from "@/components/charts/segment-bars"
import { StoryFrame } from "@/components/story/story-frame"
import { NarrativeBeat } from "@/components/story/beat"
import { Icon } from "@/components/icons/icon-defs"
import { getCoverageData } from "@/lib/data/loaders"
import { fmt } from "@/lib/format"
import type { Headline } from "@/lib/insights"
import { AustraliaMap } from "@/components/charts/australia-map"

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

export default async function CustomerPage() {
  const data = await getCoverageData()
  const latest = data.periods.at(-1)!
  const prior = data.periods.at(-2) ?? null
  const yearAgo = data.periods.at(-5) ?? null

  const htDelta = latest.htCoverage - (prior?.htCoverage ?? latest.htCoverage)
  const gtDelta = latest.gtCoverage - (prior?.gtCoverage ?? latest.gtCoverage)
  const htMembersDelta = yearAgo
    ? (latest.htInsured - yearAgo.htInsured) / yearAgo.htInsured : 0
  const populationDelta = yearAgo
    ? (latest.population - yearAgo.population) / yearAgo.population : 0

  const labels = data.periods.map((p) => p.periodLabel)
  const htSpark = data.periods.map((p) => p.htInsured)
  const htCovSpark = data.periods.map((p) => p.htCoverage * 100)
  const gtSpark = data.periods.map((p) => p.gtInsured)
  const popSpark = data.periods.map((p) => p.population)

  const sortedStates = [...data.states].sort((a, b) => b.htCoverage - a.htCoverage)
  const topState = sortedStates[0]
  const bottomState = sortedStates[sortedStates.length - 1]

  const totalInsured = data.agePyramid.reduce((s, b) => s + b.male + b.female, 0)
  const workingAgeShare = data.agePyramid
    .filter((b) => { const start = parseInt(b.ageBand); return !isNaN(start) && start >= 30 && start <= 64 })
    .reduce((s, b) => s + b.male + b.female, 0) / totalInsured

  // Structured headline for KpiHero
  const headline: Headline = {
    status: htDelta > 0.001 ? "healthy" : "watch",
    statusLabel: htDelta > 0.001 ? "Healthy" : "Watch",
    part1: htDelta > 0.001 ? "Growing membership" : "Stable membership",
    part2: htDelta > 0.001 ? "coverage expanding" : "coverage flat",
    part2Status: htDelta > 0.001 ? "healthy" : "watch",
    sentence: `${fmt.number(latest.htInsured)} Australians have hospital cover, ${fmt.percent(latest.htCoverage)} of the population — ${htDelta > 0 ? "up" : "down"} ${fmt.pp(Math.abs(htDelta))} on the prior quarter.`,
    signals: [
      {
        label: "HT insured",
        value: fmt.number(latest.htInsured),
        delta: htMembersDelta ? `${htMembersDelta > 0 ? "+" : ""}${fmt.percent(Math.abs(htMembersDelta))} YoY` : undefined,
        trend: htMembersDelta > 0.001 ? "up" : htMembersDelta < -0.001 ? "down" : "flat",
        inverse: false,
      },
      {
        label: "HT coverage",
        value: fmt.percent(latest.htCoverage),
        delta: htDelta ? `${htDelta > 0 ? "+" : ""}${(htDelta * 100).toFixed(2)}pp QoQ` : undefined,
        trend: htDelta > 0.001 ? "up" : htDelta < -0.001 ? "down" : "flat",
        inverse: false,
      },
      {
        label: "Top state",
        value: topState ? `${topState.state} ${fmt.percent(topState.htCoverage)}` : "–",
        trend: "flat",
        inverse: false,
      },
    ],
    period: latest.periodLabel,
  }

  const exploreView = (
    <div className="space-y-5">
      <KpiHero headline={headline} />

      <KpiStrip>
        <KpiTile id="cust-ht-insured" label="Hospital insured"
          rawValue={latest.htInsured} format="number"
          delta={{ value: htMembersDelta }}
          sparklineValues={htSpark} sparklineLabels={labels}
          subtext="Australians with hospital cover, summed across all policy types."
          footnote={[fmt.percent(latest.htCoverage) + " coverage", "of population"]}
          tint="deep" labelIcon="eye-open" cornerIcon="trend-up" />
        <KpiTile id="cust-ht-coverage" label="HT coverage"
          rawValue={latest.htCoverage * 100} format="pp"
          delta={{ value: htDelta, unit: "pp" }}
          sparklineValues={htCovSpark} sparklineLabels={labels}
          subtext="Hospital cover as a share of total population."
          footnote={[prior?.htCoverage ? `Prior ${fmt.percent(prior.htCoverage)}` : "", "QoQ"]}
          labelIcon="stethoscope" cornerIcon="activity" />
        <KpiTile id="cust-gt-insured" label="General treatment"
          rawValue={latest.gtInsured} format="number"
          delta={{ value: gtDelta, unit: "pp" }}
          sparklineValues={gtSpark} sparklineLabels={labels}
          subtext="Australians with extras cover — dental, optical, allied health."
          footnote={[fmt.percent(latest.gtCoverage) + " coverage", "of population"]}
          labelIcon="stethoscope" cornerIcon="activity" />
        <KpiTile id="cust-population" label="Population"
          rawValue={latest.population} format="number"
          delta={{ value: populationDelta }}
          sparklineValues={popSpark} sparklineLabels={labels}
          subtext="Total Australian population — denominator for coverage rates."
          footnote={["ABS estimate", latest.periodLabel]}
          labelIcon="eye-open" cornerIcon="trend-up" />
        <KpiTile id="cust-top-state" label="Top state coverage"
          rawValue={topState ? topState.htCoverage * 100 : 0} format="pp"
          subtext={topState ? `${topState.state} leads. ${bottomState?.state} lowest at ${fmt.percent(bottomState?.htCoverage ?? 0)}.` : ""}
          footnote={[topState?.state ?? "", "HT coverage"]}
          tint="cream" labelIcon="stethoscope" cornerIcon="alert" />
      </KpiStrip>

      {/* Coverage by state + age pyramid */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-6 glass" style={{ overflow: "visible" }}>
          <SectionHeader
            title="Coverage by state."
           
            subtitle="Hospital cover penetration as a share of state population, ranked highest to lowest." />
          <div className="mt-4">
            <AustraliaMap states={data.states} metric="htCoverage" />
          </div>
          <p className="font-sans text-[12px] mt-4" style={{ color: "var(--color-text-tertiary)" }}>
            ACT, NSW and QLD lead the country. NT lags significantly — a structural pattern across the dataset.
          </p>
        </div>

        <div className="col-span-12 lg:col-span-6 glass">
          <SectionHeader
            title="Member age distribution."
           
            subtitle="Hospital-insured persons by age band and gender. Hover any band to see counts." />
          <div className="mt-2">
            <PopulationPyramid data={data.agePyramid} />
          </div>
          <p className="font-sans text-[12px] mt-2" style={{ color: "var(--color-text-tertiary)" }}>
            {fmt.percent(workingAgeShare)} of insured persons are aged 30–64 — the working-age core that subsidises older cohorts. The 20–24 dip reflects price sensitivity at lower incomes.
          </p>
        </div>
      </div>

      {/* Segment bars */}
      <div className="glass">
        <SectionHeader
          title="Membership by life stage."
         
          subtitle="Member counts, retention rate and net new this quarter, segmented by age cohort." />
        <div className="mt-5">
          <SegmentBars segments={data.segments} />
        </div>
        <p className="font-sans text-[12px] mt-4" style={{ color: "var(--color-text-tertiary)" }}>
          Older cohorts retain at significantly higher rates — the under-30 segment churns at three times the rate of 65+. Premium per member rises with age, partially offsetting higher claims cost.
        </p>
      </div>

      {/* State detail table */}
      <div className="glass">
        <SectionHeader
          title="State-level detail."
         
          subtitle="All states, both cover types, ordered by total population."
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
                {["State", "Population", "HT insured", "HT coverage", "GT insured", "GT coverage"].map((h, i) => (
                  <th key={h} className={`py-3 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] ${i === 0 ? "text-left pr-4" : "text-right px-3"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...data.states].sort((a, b) => b.population - a.population).map((s, idx) => (
                <tr key={s.state} className="hover:bg-white/40 transition-colors"
                  style={{ borderBottom: "0.5px solid var(--color-border-subtle)" }}>
                  <td className="py-3 pr-4 font-sans font-semibold text-[13px]"
                    style={{ color: "var(--color-bupa-navy)" }}>{s.state}</td>
                  <td className="py-3 px-3 text-right" style={{ color: "var(--color-text-primary)" }}>{fmt.number(s.population)}</td>
                  <td className="py-3 px-3 text-right" style={{ color: "var(--color-text-primary)" }}>{fmt.number(s.htInsured)}</td>
                  <td className="py-3 px-3 text-right"><PillCell value={s.htCoverage} threshold={0.45} /></td>
                  <td className="py-3 px-3 text-right" style={{ color: "var(--color-text-secondary)" }}>{fmt.number(s.gtInsured)}</td>
                  <td className="py-3 pl-3 text-right"><PillCell value={s.gtCoverage} threshold={0.40} /></td>
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
        Story · Customer & coverage
      </div>
      <h1 className="font-sans font-bold mb-6 max-w-3xl"
        style={{ fontSize: "clamp(32px, 4vw, 52px)", letterSpacing: "-0.03em", color: "var(--color-bupa-navy)" }}>
        Who&apos;s covered, who&apos;s not, who&apos;s growing.
      </h1>
      <p className="font-sans leading-relaxed max-w-2xl mb-12"
        style={{ fontSize: "16px", color: "var(--color-text-secondary)" }}>
        A detailed narrative walkthrough of {latest.periodLabel} membership and coverage data is coming soon.
        Toggle Story Mode off to explore the data freely.
      </p>
      <NarrativeBeat
       
        claim={headline.sentence}
        body={<p>The detailed breakdown by state, age, and life-stage segment is explored in the standard dashboard view.</p>}
        visual={<KpiHero headline={headline} />}
        fullWidth
      />
    </div>
  )

  return <StoryFrame story={storyView} explore={exploreView} />
}