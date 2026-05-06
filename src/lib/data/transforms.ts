import type { Period } from "./schemas"

export type WaterfallStep = {
  label: string
  value: number // amount of change (signed)
  type: "start" | "increase" | "decrease" | "end"
  cumulative: number // running total at this step
}

/**
 * Decomposes the period-over-period revenue change into its drivers.
 * For the demo we use a simplified attribution: the total change is
 * split between "premium rate effect" (volume × rate change) and
 * "member volume effect" (rate × volume change). In production this
 * would come from internal pricing data; here we approximate.
 */
export function buildRevenueWaterfall(
  current: Period,
  prior: Period
): WaterfallStep[] {
  const start = prior.insuranceRevenue ?? 0
  const end = current.insuranceRevenue ?? 0
  const totalChange = end - start

  // Approximation: split total change 70/30 between rate and volume
  // (industry rule of thumb — premium increases drive most revenue growth)
  const rateEffect = Math.round(totalChange * 0.7)
  const volumeEffect = totalChange - rateEffect
  const reinsuranceImpact = (current.netReinsurance ?? 0) - (prior.netReinsurance ?? 0)

  let cumulative = start

  const steps: WaterfallStep[] = [
    {
      label: prior.periodLabel,
      value: start,
      type: "start",
      cumulative: start,
    },
  ]

  if (rateEffect !== 0) {
    cumulative += rateEffect
    steps.push({
      label: "Premium rates",
      value: rateEffect,
      type: rateEffect > 0 ? "increase" : "decrease",
      cumulative,
    })
  }

  if (volumeEffect !== 0) {
    cumulative += volumeEffect
    steps.push({
      label: "Member volume",
      value: volumeEffect,
      type: volumeEffect > 0 ? "increase" : "decrease",
      cumulative,
    })
  }

  if (Math.abs(reinsuranceImpact) > 1_000_000) {
    cumulative -= reinsuranceImpact
    steps.push({
      label: "Reinsurance",
      value: -reinsuranceImpact,
      type: -reinsuranceImpact > 0 ? "increase" : "decrease",
      cumulative,
    })
  }

  // Reconcile to actual end value (small rounding adjustment)
  const reconciliation = end - cumulative
  if (Math.abs(reconciliation) > 100) {
    steps.push({
      label: "Other",
      value: reconciliation,
      type: reconciliation > 0 ? "increase" : "decrease",
      cumulative: end,
    })
  }

  steps.push({
    label: current.periodLabel,
    value: end,
    type: "end",
    cumulative: end,
  })

  return steps
}

/**
 * Profit composition over time — splits net profit into underwriting profit
 * (insurance service result) vs investment profit (post-tax estimate).
 */
export type ProfitComposition = {
  periodEnd: string
  periodLabel: string
  underwritingProfit: number
  investmentProfit: number
  total: number
}

export function buildProfitComposition(periods: Period[]): ProfitComposition[] {
  return periods
    .filter((p) => p.insuranceServiceResult !== undefined && p.investmentResult !== undefined)
    .map((p) => {
      const underwriting = p.insuranceServiceResult ?? 0
      const investment = p.investmentResult ?? 0
      // Approximation: apply ~70% post-tax factor (Australian corporate tax 30%)
      return {
        periodEnd: p.periodEnd,
        periodLabel: p.periodLabel,
        underwritingProfit: Math.round(underwriting * 0.7),
        investmentProfit: Math.round(investment * 0.7),
        total: Math.round((underwriting + investment) * 0.7),
      }
    })
}

/**
 * Computes industry-standard targets for the bullet chart strip.
 * For the demo, targets are derived from the 8-quarter rolling median.
 * In production these would be pricing-team set targets.
 */
export type BulletData = {
  label: string
  unit: "percent"
  actual: number
  target: number
  /** Three-band quality range, low to high */
  range: [number, number, number]
  /** When true, lower values are better (e.g. loss ratio) */
  inverse?: boolean
}

export function buildBulletData(periods: Period[]): BulletData[] {
  const recent = periods.slice(-8)
  const latest = recent.at(-1)
  if (!latest) return []

  const median = (arr: number[]) => {
    const sorted = [...arr].sort((a, b) => a - b)
    return sorted[Math.floor(sorted.length / 2)]
  }

  const margins = recent
    .map((p) => p.netMargin)
    .filter((v): v is number => v !== undefined)
  const lossRatios = recent
    .map((p) => p.lossRatio)
    .filter((v): v is number => v !== undefined)
  const investmentYields = recent
    .map((p) =>
      p.investmentResult && p.capitalBase
        ? (p.investmentResult * 4) / p.capitalBase // annualised yield
        : null
    )
    .filter((v): v is number => v !== null)

  const marginTarget = median(margins)
  const lossTarget = median(lossRatios)
  const yieldTarget = median(investmentYields)

  const data: BulletData[] = []

  if (latest.netMargin !== undefined) {
    data.push({
      label: "Net margin",
      unit: "percent",
      actual: latest.netMargin,
      target: marginTarget,
      range: [marginTarget * 0.7, marginTarget, marginTarget * 1.3],
    })
  }

  if (latest.lossRatio !== undefined) {
    data.push({
      label: "Loss ratio",
      unit: "percent",
      actual: latest.lossRatio,
      target: lossTarget,
      range: [lossTarget * 0.95, lossTarget, lossTarget * 1.05],
      inverse: true,
    })
  }

  if (latest.underwritingMargin !== undefined) {
    const utmMedian = median(
      recent.map((p) => p.underwritingMargin).filter((v): v is number => v !== undefined)
    )
    data.push({
      label: "Underwriting margin",
      unit: "percent",
      actual: latest.underwritingMargin,
      target: utmMedian,
      range: [utmMedian * 0.6, utmMedian, utmMedian * 1.4],
    })
  }

  if (latest.investmentResult && latest.capitalBase) {
    const annualisedYield = (latest.investmentResult * 4) / latest.capitalBase
    data.push({
      label: "Investment yield",
      unit: "percent",
      actual: annualisedYield,
      target: yieldTarget,
      range: [yieldTarget * 0.5, yieldTarget, yieldTarget * 1.5],
    })
  }

  return data
}