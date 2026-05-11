import type { Period } from "./data/schemas"
import { fmt } from "./format"

export type HealthStatus = "healthy" | "watch" | "action"

export type Headline = {
  status: HealthStatus
  statusLabel: string
  sentence: string
  period: string
}

/**
 * Generate the top-of-page headline for the Overview tab.
 * Looks at the latest period and prior period to decide tone.
 */
export function generateHeadline(latest: Period, prior: Period | null): Headline {
  const lossRatio = latest.lossRatio ?? 0
  const netMargin = latest.netMargin ?? 0
  const priorMargin = prior?.netMargin ?? netMargin
  const marginDelta = netMargin - priorMargin

  // Status thresholds · rough industry conventions
  let status: HealthStatus = "healthy"
  if (netMargin < 0.04 || lossRatio > 0.88) status = "action"
  else if (netMargin < 0.05 || lossRatio > 0.86 || marginDelta < -0.01) status = "watch"

  const statusLabel = status === "healthy" ? "Healthy" : status === "watch" ? "Watch" : "Action"

  const revenueGrowth = latest.revenueYoY
  const directionWord = marginDelta > 0 ? "expanding" : marginDelta < -0.005 ? "compressing" : "holding"
  const revenuePhrase = revenueGrowth
    ? `with revenue ${revenueGrowth > 0 ? "up" : "down"} ${fmt.percent(Math.abs(revenueGrowth))} YoY`
    : ""

  const sentence = `Industry net margin ${directionWord} at ${fmt.percent(netMargin)} on a loss ratio of ${fmt.percent(lossRatio)}${revenuePhrase ? ", " + revenuePhrase : ""}.`

  return {
    status,
    statusLabel,
    sentence,
    period: latest.periodLabel,
  }
}

export type WatchItem = {
  severity: "watch" | "action"
  title: string
  detail: string
}

/**
 * Identify watch list items from recent data.
 * Real production version would have many rules; for the demo we surface
 * the most narratively interesting signals.
 */
export function generateWatchList(periods: Period[]): WatchItem[] {
  const items: WatchItem[] = []
  const latest = periods.at(-1)
  const prior = periods.at(-2)
  if (!latest || !prior) return items

  // 1. Loss ratio trending up
  if (latest.lossRatio && prior.lossRatio && latest.lossRatio - prior.lossRatio > 0) {
    const change = latest.lossRatio - prior.lossRatio
    items.push({
      severity: latest.lossRatio > 0.85 ? "action" : "watch",
      title: `Loss ratio up ${fmt.pp(change)} QoQ`,
      detail: `Now at ${fmt.percent(latest.lossRatio)}, third consecutive quarter rising`,
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