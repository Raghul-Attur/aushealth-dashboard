import { KpiHero } from "@/components/kpi/kpi-hero"
import { KpiTile } from "@/components/kpi/kpi-tile"
import { KpiStrip } from "@/components/kpi/kpi-strip"
import { Card } from "@/components/layout/card"
import { SectionHeader } from "@/components/layout/section-header"
import { PopulationPyramid } from "@/components/charts/population-pyramid"
import { StateCoverageList } from "@/components/charts/state-coverage-list"
import { SegmentBars } from "@/components/charts/segment-bars"
import { StoryFrame } from "@/components/story/story-frame"
import { NarrativeBeat } from "@/components/story/beat"
import { getCoverageData } from "@/lib/data/loaders"
import { fmt } from "@/lib/format"

export default async function CustomerPage() {
  const data = await getCoverageData()
  const latest = data.periods.at(-1)!
  const prior = data.periods.at(-2) ?? null
  const yearAgo = data.periods.at(-5) ?? null

  // Deltas
  const htDelta = latest.htCoverage - (prior?.htCoverage ?? latest.htCoverage)
  const gtDelta = latest.gtCoverage - (prior?.gtCoverage ?? latest.gtCoverage)
  const htMembersDelta = yearAgo
    ? (latest.htInsured - yearAgo.htInsured) / yearAgo.htInsured
    : 0
  const populationDelta = yearAgo
    ? (latest.population - yearAgo.population) / yearAgo.population
    : 0

  // Sparklines
  const labels = data.periods.map((p) => p.periodLabel)
  const htSpark = data.periods.map((p) => p.htInsured)
  const htCovSpark = data.periods.map((p) => p.htCoverage * 100)
  const gtSpark = data.periods.map((p) => p.gtInsured)
  const popSpark = data.periods.map((p) => p.population)

  // Headline
  const headline = {
    status: htDelta > 0.001 ? "healthy" : ("watch" as "healthy" | "watch" | "action"),
    statusLabel: htDelta > 0.001 ? "Healthy" : "Watch",
    sentence: `${fmt.number(latest.htInsured)} Australians have hospital cover, ${fmt.percent(latest.htCoverage)} of the population, ${htDelta > 0 ? "up" : "down"} ${fmt.pp(Math.abs(htDelta))} on the prior quarter.`,
    period: latest.periodLabel,
  }

  // Highest and lowest coverage states
  const sortedStates = [...data.states].sort((a, b) => b.htCoverage - a.htCoverage)
  const topState = sortedStates[0]
  const bottomState = sortedStates[sortedStates.length - 1]

  // Working-age share calculation
  const totalInsured = data.agePyramid.reduce((s, b) => s + b.male + b.female, 0)
  const workingAgeShare = data.agePyramid
    .filter((b) => {
      const start = parseInt(b.ageBand)
      return !isNaN(start) && start >= 30 && start <= 64
    })
    .reduce((s, b) => s + b.male + b.female, 0) / totalInsured

  const exploreView = (
    <div className="space-y-4">
      {/* Row 1: Headline */}
      <KpiHero headline={headline} />

      {/* Row 2: KPI strip */}
      <KpiStrip>
        <KpiTile
          id="cust-ht-insured"
          label="Hospital insured"
          rawValue={latest.htInsured}
          format="number"
          delta={{ value: htMembersDelta }}
          sparklineValues={htSpark}
          sparklineLabels={labels}
          subtext="Australians with hospital cover, summed across all policy types."
          emphasis
        />
        <KpiTile
          id="cust-ht-coverage"
          label="HT coverage"
          rawValue={latest.htCoverage * 100}
          format="pp"
          delta={{ value: htDelta, unit: "pp" }}
          sparklineValues={htCovSpark}
          sparklineLabels={labels}
          subtext="Hospital cover as a share of total population."
        />
        <KpiTile
          id="cust-gt-insured"
          label="General treatment"
          rawValue={latest.gtInsured}
          format="number"
          delta={{ value: gtDelta, unit: "pp" }}
          sparklineValues={gtSpark}
          sparklineLabels={labels}
          subtext="Australians with extras (dental, optical, allied health) cover."
        />
        <KpiTile
          id="cust-population"
          label="Population"
          rawValue={latest.population}
          format="number"
          delta={{ value: populationDelta }}
          sparklineValues={popSpark}
          sparklineLabels={labels}
          subtext="Total Australian population. Denominator for coverage."
        />
        <KpiTile
          id="cust-top-state"
          label="Top state"
          rawValue={topState.htCoverage * 100}
          format="pp"
          subtext={`${topState.state} leads in HT coverage. ${bottomState.state} lowest at ${fmt.percent(bottomState.htCoverage)}.`}
        />
      </KpiStrip>

      {/* Row 3: Coverage by state + age pyramid */}
      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-12 lg:col-span-5">
          <SectionHeader
            title="Coverage by state"
            subtitle="Hospital cover penetration as a share of state population, ranked highest to lowest."
          />
          <div className="mt-4">
            <StateCoverageList states={data.states} metric="htCoverage" />
          </div>
          <p className="text-caption text-text-tertiary mt-4">
            ACT, NSW and QLD lead the country. NT lags significantly, a structural pattern across the dataset.
          </p>
        </Card>

        <Card className="col-span-12 lg:col-span-7">
          <SectionHeader
            title="Member age distribution"
            subtitle="Hospital-insured persons by age band and gender. Hover any band to see counts."
          />
          <div className="mt-2">
            <PopulationPyramid data={data.agePyramid} />
          </div>
          <p className="text-caption text-text-tertiary mt-2">
            {fmt.percent(workingAgeShare)} of insured persons are aged 30-64, the working-age core that subsidises older cohorts. The 20-24 dip reflects price sensitivity at lower incomes.
          </p>
        </Card>
      </div>

      {/* Row 4: Segment bars */}
      <Card>
        <SectionHeader
          title="Membership by life stage"
          subtitle="Member counts, retention rate and net new this quarter, segmented by age cohort."
        />
        <div className="mt-5">
          <SegmentBars segments={data.segments} />
        </div>
        <p className="text-caption text-text-tertiary mt-4">
          Older cohorts retain at significantly higher rates. The under-30 segment churns at three times the rate of 65+. Premium per member rises with age, partially offsetting the higher claims cost.
        </p>
      </Card>

      {/* Row 5: Detail table */}
      <Card>
        <SectionHeader
          title="State-level detail"
          subtitle="All states, both cover types, ordered by total population."
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-body-sm tabular">
            <thead>
              <tr className="border-b border-border-subtle text-text-secondary text-caption">
                <th className="text-left font-normal py-2 pr-4">State</th>
                <th className="text-right font-normal py-2 px-4">Population</th>
                <th className="text-right font-normal py-2 px-4">HT insured</th>
                <th className="text-right font-normal py-2 px-4">HT coverage</th>
                <th className="text-right font-normal py-2 px-4">GT insured</th>
                <th className="text-right font-normal py-2 pl-4">GT coverage</th>
              </tr>
            </thead>
            <tbody>
              {[...data.states]
                .sort((a, b) => b.population - a.population)
                .map((s) => (
                  <tr
                    key={s.state}
                    className="border-b border-border-subtle last:border-b-0 hover:bg-subtle transition-colors"
                  >
                    <td className="py-2.5 pr-4 font-medium">{s.state}</td>
                    <td className="py-2.5 px-4 text-right">{fmt.number(s.population)}</td>
                    <td className="py-2.5 px-4 text-right">{fmt.number(s.htInsured)}</td>
                    <td className="py-2.5 px-4 text-right">{fmt.percent(s.htCoverage)}</td>
                    <td className="py-2.5 px-4 text-right">{fmt.number(s.gtInsured)}</td>
                    <td className="py-2.5 pl-4 text-right">{fmt.percent(s.gtCoverage)}</td>
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
        Story · Customer & coverage
      </div>
      <h1 className="text-display leading-tight mb-6 max-w-3xl">
        Who&apos;s covered, who&apos;s not, who&apos;s growing.
      </h1>
      <p className="text-body text-text-secondary leading-relaxed max-w-2xl mb-12">
        A detailed narrative walkthrough of {latest.periodLabel} membership and coverage data is coming soon.
        In the meantime, the dashboard view remains fully interactive. Toggle Story Mode off
        in the app bar to explore the data freely.
      </p>
      <NarrativeBeat
        eyebrow="Headline result"
        claim={headline.sentence}
        body={
          <p>
            The detailed breakdown by state, age, and life-stage segment is explored in the standard dashboard view.
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