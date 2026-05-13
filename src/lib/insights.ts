import type { Period } from "./data/schemas"
import { fmt } from "./format"

export type HealthStatus = "healthy" | "watch" | "action"

export type Headline = {
  status: HealthStatus
  statusLabel: string
  // Structured two-part display headline
  part1: string
  part2: string
  part2Status: HealthStatus
  // Lede paragraph
  sentence: string
  // Inline signal strip — 3 key data points
  signals: Signal[]
  period: string
}

export type Signal = {
  label: string
  value: string
  delta?: string
  trend: "up" | "down" | "flat"
  inverse?: boolean  // true = up is bad (loss ratio)
}

export type WatchItem = {
  severity: "watch" | "action"
  title: string
  detail: string
}

// ── Headline part generators ────────────────────────────────────────────────

function marginPart1(marginDelta: number, netMargin: number): string {
  if (netMargin < 0.04) return "Margin under pressure"
  if (marginDelta > 0.005) return "Expanding margin"
  if (marginDelta < -0.01) return "Compressing margin"
  if (marginDelta < -0.005) return "Softening margin"
  return "Stable margin"
}

function claimsPart2(
  lossRatio: number,
  lossRatioDelta: number,
  consecutiveRising: number
): { text: string; status: HealthStatus } {
  if (lossRatio > 0.88) return { text: "claims critical", status: "action" }
  if (lossRatio > 0.86 && consecutiveRising >= 3) return { text: "claims accelerating", status: "action" }
  if (lossRatioDelta > 0.003 && consecutiveRising >= 3) return { text: "rising claims", status: "watch" }
  if (lossRatioDelta > 0.003) return { text: "claims ticking up", status: "watch" }
  if (lossRatioDelta < -0.003) return { text: "claims easing", status: "healthy" }
  if (lossRatio < 0.83) return { text: "claims in check", status: "healthy" }
  return { text: "claims holding", status: "healthy" }
}

function countConsecutiveRising(periods: Period[]): number {
  let count = 0
  for (let i = periods.length - 1; i > 0; i--) {
    const curr = periods[i].lossRatio ?? 0
    const prev = periods[i - 1].lossRatio ?? 0
    if (curr > prev) count++
    else break
  }
  return count
}

// ── Main headline generator ─────────────────────────────────────────────────

export function generateHeadline(
  latest: Period,
  prior: Period | null,
  recent: Period[] = []
): Headline {
  const lossRatio = latest.lossRatio ?? 0
  const netMargin = latest.netMargin ?? 0
  const priorMargin = prior?.netMargin ?? netMargin
  const priorLossRatio = prior?.lossRatio ?? lossRatio
  const marginDelta = netMargin - priorMargin
  const lossRatioDelta = lossRatio - priorLossRatio
  const consecutiveRising = countConsecutiveRising(recent.length > 0 ? recent : [])

  // Overall status
  let status: HealthStatus = "healthy"
  if (netMargin < 0.04 || lossRatio > 0.88) status = "action"
  else if (netMargin < 0.05 || lossRatio > 0.86 || marginDelta < -0.01) status = "watch"

  const statusLabel =
    status === "healthy" ? "Healthy" : status === "watch" ? "Watch" : "Action"

  // Two-part headline
  const part1 = marginPart1(marginDelta, netMargin)
  const { text: part2, status: part2Status } = claimsPart2(
    lossRatio, lossRatioDelta, consecutiveRising
  )

  // Lede sentence
  const directionWord =
    marginDelta > 0 ? "expanding" : marginDelta < -0.005 ? "compressing" : "holding"
  const revenuePhrase = latest.revenueYoY
    ? `, with revenue ${latest.revenueYoY > 0 ? "up" : "down"} ${fmt.percent(Math.abs(latest.revenueYoY))} YoY`
    : ""
  const sentence = `TTM net margin holds at ${latest.ttmNetMargin ? fmt.percent(latest.ttmNetMargin) : fmt.percent(netMargin)} while loss ratio creeps to ${fmt.percent(lossRatio)} — the ${consecutiveRising > 1 ? `${ordinal(consecutiveRising)} consecutive` : ""} quarter of claims growing faster than premiums${revenuePhrase}. Underwriting result remains positive on ${latest.ttmRevenue ? fmt.currency(latest.ttmRevenue) : ""} trailing revenue.`

  // Signal strip — 3 most exec-relevant data points
  const signals: Signal[] = [
    {
      label: "Net margin",
      value: fmt.percent(netMargin),
      delta: marginDelta !== 0 ? `${marginDelta > 0 ? "+" : ""}${(marginDelta * 100).toFixed(2)}pp QoQ` : undefined,
      trend: marginDelta > 0.001 ? "up" : marginDelta < -0.001 ? "down" : "flat",
      inverse: false,
    },
    {
      label: "Loss ratio",
      value: fmt.percent(lossRatio),
      delta: lossRatioDelta !== 0 ? `${lossRatioDelta > 0 ? "+" : ""}${(lossRatioDelta * 100).toFixed(2)}pp QoQ` : undefined,
      trend: lossRatioDelta > 0.001 ? "up" : lossRatioDelta < -0.001 ? "down" : "flat",
      inverse: true,
    },
    {
      label: "TTM revenue",
      value: latest.ttmRevenue ? fmt.currency(latest.ttmRevenue) : fmt.currency(latest.insuranceRevenue ?? 0),
      delta: latest.revenueYoY ? `${latest.revenueYoY > 0 ? "+" : ""}${fmt.percent(Math.abs(latest.revenueYoY))} YoY` : undefined,
      trend: (latest.revenueYoY ?? 0) > 0.005 ? "up" : (latest.revenueYoY ?? 0) < -0.005 ? "down" : "flat",
      inverse: false,
    },
  ]

  return {
    status,
    statusLabel,
    part1,
    part2,
    part2Status,
    sentence,
    signals,
    period: latest.periodLabel,
  }
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

// ── Watch list ──────────────────────────────────────────────────────────────

export function generateWatchList(periods: Period[]): WatchItem[] {
  const items: WatchItem[] = []
  const latest = periods.at(-1)
  const prior = periods.at(-2)
  if (!latest || !prior) return items

  // 1. Loss ratio trending up
  if (latest.lossRatio && prior.lossRatio && latest.lossRatio - prior.lossRatio > 0) {
    const change = latest.lossRatio - prior.lossRatio
    const consecutive = countConsecutiveRising(periods)
    items.push({
      severity: latest.lossRatio > 0.85 ? "action" : "watch",
      title: `Loss ratio up ${fmt.pp(change)} QoQ`,
      detail: `Now at ${fmt.percent(latest.lossRatio)}, ${consecutive > 1 ? `${ordinal(consecutive)} consecutive quarter rising` : "rising this quarter"}`,
    })
  }

  // 2. Net margin compression
  if (latest.ttmNetMargin) {
    const fourQuartersAgo = periods.at(-5)
    if (fourQuartersAgo?.ttmNetMargin) {
      const compression = fourQuartersAgo.ttmNetMargin - latest.ttmNetMargin
      if (compression > 0.005) {
        items.push({
          severity: "watch",
          title: `TTM net margin compressed ${fmt.pp(compression)}`,
          detail: `${fmt.percent(fourQuartersAgo.ttmNetMargin)} a year ago to ${fmt.percent(latest.ttmNetMargin)} now`,
        })
      }
    }
  }

  // 3. Investment result swing
  if (latest.investmentResult && prior.investmentResult) {
    const change = latest.investmentResult - prior.investmentResult
    const ratio = Math.abs(change) / Math.abs(prior.investmentResult)
    if (ratio > 0.2 && Math.abs(change) > 50_000_000) {
      const direction = change > 0 ? "rose" : "fell"
      items.push({
        severity: "watch",
        title: `Investment result ${direction} ${fmt.percent(ratio)} QoQ`,
        detail: `${fmt.currency(prior.investmentResult)} → ${fmt.currency(latest.investmentResult)}`,
      })
    }
  }

  return items.slice(0, 3)
}

// Re-export fmt.pp for convenience
export { fmt }