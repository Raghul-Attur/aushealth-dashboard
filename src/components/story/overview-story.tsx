"use client"

import { Beat, NarrativeBeat } from "@/components/story/beat"
import { KpiHero } from "@/components/kpi/kpi-hero"
import { KpiTile } from "@/components/kpi/kpi-tile"
import { Sparkline } from "@/components/kpi/sparkline"
import { LayeredAreaChart } from "@/components/charts/layered-area"
import { WatchListCard } from "@/components/layout/watch-list-card"
import { fmt } from "@/lib/format"
import type { Period } from "@/lib/data/schemas"
import type { Headline, WatchItem } from "@/lib/insights"

type Props = {
  headline: Headline
  latest: Period
  prior: Period | null
  yearAgo: Period | null
  recent: Period[]
  watchList: WatchItem[]
}

export function OverviewStory({
  headline,
  latest,
  prior,
  yearAgo,
  recent,
  watchList,
}: Props) {
  const revenueGrowth = latest.revenueYoY ?? 0
  const profitGrowth = latest.netProfitYoY ?? 0
  const marginDelta = (latest.ttmNetMargin ?? 0) - (yearAgo?.ttmNetMargin ?? 0)
  const investmentShare =
    latest.investmentResult && latest.netProfit
      ? latest.investmentResult / latest.netProfit
      : 0

  const claimsGrowthRate = prior && latest.incurredClaims && prior.incurredClaims
    ? (latest.incurredClaims - prior.incurredClaims) / prior.incurredClaims
    : 0

  const labels = recent.map((p) => p.periodLabel)
  const marginSpark = recent.map((p) => (p.netMargin ?? 0) * 100)
  const investmentSpark = recent.map((p) => p.investmentResult ?? 0)
  const lossRatioSpark = recent.map((p) => (p.lossRatio ?? 0) * 100)

  return (
    <article className="py-12">
      {/* === Opening === */}
      <Beat>
        <div className="max-w-3xl">
          <div className="text-caption uppercase tracking-wider text-text-tertiary mb-4">
            Story · Industry overview · {latest.periodLabel}
          </div>
          <h1 className="text-display leading-tight mb-6">
            A profitable industry, with the engine quietly shifting underneath.
          </h1>
          <div className="text-body text-text-secondary leading-relaxed space-y-4 max-w-3xl">
            <p>
              Australia&apos;s private health insurance industry closed{" "}
              {latest.periodLabel} with{" "}
              <span className="text-text-primary font-medium tabular">
                {fmt.currency(latest.netProfit ?? 0)}
              </span>{" "}
              in after-tax profit — the headline result that will frame
              boardroom conversations through January.
            </p>
            <p>
              But the headline conceals two crosswinds: top-line revenue growing
              steadily on the back of premium increases, and bottom-line margin
              compressing as claims experience deteriorates and investment
              income remains volatile. This is the story of a sector still
              profitable, but where the composition of that profitability is
              shifting in ways worth watching.
            </p>
          </div>
        </div>
      </Beat>

      {/* === Beat 1: The headline number === */}
      <NarrativeBeat
        eyebrow="The result"
        claim={`Net margin of ${fmt.percent(latest.netMargin ?? 0)} — within historical range, but slipping.`}
        body={
          <>
            <p>
              On {fmt.currency(latest.insuranceRevenue ?? 0)} of quarterly
              insurance revenue, funds returned{" "}
              <span className="text-text-primary font-medium tabular">
                {fmt.percent(latest.netMargin ?? 0)}
              </span>{" "}
              to the bottom line. That&apos;s a healthy result in absolute
              terms — most industries would be content with it — but the
              trajectory matters more than the level.
            </p>
            <p>
              Margin has compressed{" "}
              <span className="text-text-primary font-medium tabular">
                {fmt.pp(Math.abs(marginDelta))}
              </span>{" "}
              over the trailing twelve months, a pattern visible in the
              rolling figure rather than any single quarter.
            </p>
          </>
        }
        visual={
            <div className="bg-surface rounded-xl border border-border-subtle p-6">
              <div className="text-caption text-text-secondary mb-3">
                Net margin · {latest.periodLabel}
              </div>
              <div className="text-kpi-hero tabular leading-none mb-2">
                {fmt.percent(latest.netMargin ?? 0)}
              </div>
              <div className="text-caption text-text-tertiary tabular mb-4">
                {fmt.pp(marginDelta)} vs same quarter last year
              </div>
              <Sparkline
                values={marginSpark}
                labels={labels}
                width={320}
                height={56}
                expandedWidth={320}
                expandedHeight={56}
                static
              />
              <div className="flex justify-between text-micro text-text-tertiary tabular mt-1.5">
                <span>{labels[0]}</span>
                <span>{labels.at(-1)}</span>
              </div>
            </div>
          }
        side="right"
      />

      {/* === Beat 2: Revenue rising, profit falling === */}
      <NarrativeBeat
        eyebrow="The divergence"
        claim={`Revenue ${revenueGrowth > 0 ? "up" : "down"} ${fmt.percent(Math.abs(revenueGrowth))} year-on-year, profit ${profitGrowth > 0 ? "up" : "down"} ${fmt.percent(Math.abs(profitGrowth))}.`}
        body={
          <>
            <p>
              Premium revenue continues to grow — driven by approved rate
              increases and modest membership growth — but earnings haven&apos;t
              kept pace. Insurance revenue rose to{" "}
              <span className="text-text-primary font-medium tabular">
                {fmt.currency(latest.insuranceRevenue ?? 0)}
              </span>{" "}
              for the quarter, yet after-tax profit moved in the opposite
              direction.
            </p>
            <p>
              The gap between the two trends is the signal worth watching.
              When revenue and profit diverge, the question is always{" "}
              <em>where the friction is</em> — claims, costs, or capital.
            </p>
          </>
        }
        visual={
          <div className="bg-surface rounded-xl border border-border-subtle p-5">
            <div className="text-caption text-text-secondary mb-1">
              Revenue and claims · last 8 quarters
            </div>
            <div className="flex items-center gap-4 text-caption text-text-secondary mt-3 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-chart-1" /> Revenue
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-chart-2" /> Claims
              </div>
            </div>
            <LayeredAreaChart periods={recent} />
            <p className="text-caption text-text-tertiary mt-3">
              The space between the lines is gross margin. It&apos;s narrowing.
            </p>
          </div>
        }
        side="left"
      />

      {/* === Beat 3: Claims growth === */}
      <NarrativeBeat
        eyebrow="Where the pressure is"
        claim={`Claims grew ${fmt.percent(Math.abs(claimsGrowthRate))} this quarter, outpacing premium growth.`}
        body={
          <>
            <p>
              The loss ratio — claims divided by revenue — sits at{" "}
              <span className="text-text-primary font-medium tabular">
                {fmt.percent(latest.lossRatio ?? 0)}
              </span>
              , above the 8-quarter average. Each percentage point matters: at
              this scale, a 1pp move in the loss ratio represents roughly{" "}
              {fmt.currency((latest.insuranceRevenue ?? 0) * 0.01)} per quarter
              of additional claims cost.
            </p>
            <p>
              The drivers won&apos;t be visible from the aggregate. Procedure
              mix, deferred-care catch-up, and ageing demographics each
              contribute — questions answered in the Operational and Customer
              views.
            </p>
          </>
        }
        visual={
          <KpiTile
            id="story-loss-ratio"
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
            subtext={`${fmt.pp((latest.lossRatio ?? 0) - recent.reduce((s, p) => s + (p.lossRatio ?? 0), 0) / recent.length)} above the 8-quarter average.`}
            inverse
            emphasis
          />
        }
        side="right"
      />

      {/* === Beat 4: Investment income === */}
      <NarrativeBeat
        eyebrow="The other line"
        claim={`Investment income contributed ~${fmt.percent(investmentShare)} of profit — the line that magnifies volatility.`}
        body={
          <>
            <p>
              Australian private health insurance is fundamentally an
              underwriting business, but the investment book matters. This
              quarter, returns of{" "}
              <span className="text-text-primary font-medium tabular">
                {fmt.currency(latest.investmentResult ?? 0)}
              </span>{" "}
              accounted for nearly{" "}
              <span className="text-text-primary font-medium tabular">
                {fmt.percent(investmentShare)}
              </span>{" "}
              of after-tax earnings.
            </p>
            <p>
              When investment income runs hot, it papers over underwriting
              weakness. When it reverses — as it has in past quarters — the
              underlying margin picture becomes uncomfortably clear.
            </p>
          </>
        }
        visual={
          <KpiTile
            id="story-investment"
            label="Investment result"
            rawValue={latest.investmentResult ?? 0}
            format="currency"
            delta={{
              value:
                ((latest.investmentResult ?? 0) -
                  (prior?.investmentResult ?? 0)) /
                (prior?.investmentResult || 1),
            }}
            sparklineValues={investmentSpark}
            sparklineLabels={labels}
            subtext="Q4 is historically the most volatile quarter for investment returns."
            emphasis
          />
        }
        side="left"
      />

      {/* === Beat 5: Watch list === */}
      <Beat>
        <div className="grid grid-cols-12 gap-8 items-start">
          <div className="col-span-12 lg:col-span-5">
            <div className="text-caption uppercase tracking-wider text-text-tertiary mb-3">
              What to watch
            </div>
            <h2 className="text-h1 leading-tight mb-4">
              Three signals worth tracking into next quarter.
            </h2>
            <div className="text-body text-text-secondary leading-relaxed space-y-3">
              <p>
                Each of these is a thread that could either resolve into a
                non-event or become the headline next quarter. The dashboard
                will flag them as they evolve.
              </p>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-3">
            {watchList.length > 0 ? (
              watchList.map((item, i) => (
                <WatchListCard key={i} item={item} />
              ))
            ) : (
              <p className="text-body-sm text-text-secondary">
                No items currently flagged.
              </p>
            )}
          </div>
        </div>
      </Beat>

      {/* === Close === */}
      <Beat>
        <div className="max-w-3xl border-t border-border-subtle pt-12">
          <div className="text-caption uppercase tracking-wider text-text-tertiary mb-3">
            Looking ahead
          </div>
          <h2 className="text-h1 leading-tight mb-4 max-w-2xl">
            The next quarter will tell us whether this is compression or correction.
          </h2>
          <p className="text-body text-text-secondary leading-relaxed max-w-3xl">
            If margin holds at current levels and claims growth moderates,
            the picture is one of normalisation — a return to long-run averages
            after a few unusual years. If margins continue to compress and
            claims accelerate, the conversation shifts to pricing, network
            design, and product strategy. Both outcomes are plausible from
            today&apos;s data.
          </p>
          <div className="mt-8 flex items-center gap-3">
            <KpiHero headline={headline} />
          </div>
        </div>
      </Beat>
    </article>
  )
}