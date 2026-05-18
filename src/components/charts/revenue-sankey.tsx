"use client"

import { ResponsiveSankey } from "@nivo/sankey"
import type { Period } from "@/lib/data/schemas"
import { fmt } from "@/lib/format"

type Props = {
  latest: Period
}

export function RevenueSankey({ latest }: Props) {
  const revenue = latest.insuranceRevenue ?? 0
  const claims = latest.incurredClaims ?? 0
  const expense = latest.insuranceServiceExpense ?? 0
  const serviceResult = latest.insuranceServiceResult ?? (revenue - claims - expense)
  const investment = latest.investmentResult ?? 0
  const netProfit = latest.netProfit ?? 0

  // Derive operating costs as residual
  const operatingCosts = Math.max(0, revenue - claims - serviceResult)

  // Sankey requires positive values — guard against data gaps
  if (revenue <= 0) return (
    <div className="flex items-center justify-center h-[320px] font-sans text-[13px]"
      style={{ color: "var(--color-text-tertiary)" }}>
      Insufficient data for this period.
    </div>
  )

  const nodes = [
    { id: "Premium revenue" },
    { id: "Incurred claims" },
    { id: "Operating costs" },
    { id: "Underwriting result" },
    { id: "Investment income" },
    { id: "Net profit" },
    { id: "Tax & other" },
  ]

  // Build links — only include if value > 0
  const links = []

  if (claims > 0) {
    links.push({ source: "Premium revenue", target: "Incurred claims", value: claims })
  }
  if (operatingCosts > 0) {
    links.push({ source: "Premium revenue", target: "Operating costs", value: operatingCosts })
  }
  if (serviceResult > 0) {
    links.push({ source: "Premium revenue", target: "Underwriting result", value: serviceResult })
  }
  if (investment > 0) {
    links.push({ source: "Investment income", target: "Net profit", value: investment })
  }
  if (serviceResult > 0 && netProfit > 0) {
    const taxOther = Math.max(0, serviceResult - netProfit + investment)
    if (taxOther > 1_000_000) {
      links.push({ source: "Underwriting result", target: "Tax & other", value: taxOther })
      links.push({ source: "Underwriting result", target: "Net profit", value: Math.max(0, netProfit - investment) })
    } else {
      links.push({ source: "Underwriting result", target: "Net profit", value: serviceResult })
    }
  }

  // Colour map
  const nodeColors: Record<string, string> = {
    "Premium revenue":    "var(--color-bupa-navy)",
    "Incurred claims":    "var(--color-negative)",
    "Operating costs":    "var(--color-chart-7)",
    "Underwriting result": "var(--color-bupa-blue)",
    "Investment income":  "var(--color-bupa-teal)",
    "Net profit":         "var(--color-positive)",
    "Tax & other":        "var(--color-chart-4)",
  }

  return (
    <div style={{ height: 380 }}>
      <ResponsiveSankey
        data={{ nodes, links }}
        margin={{ top: 24, right: 160, bottom: 24, left: 160 }}
        align="justify"
        colors={(node) => nodeColors[node.id as string] ?? "var(--color-chart-1)"}
        nodeOpacity={1}
        nodeThickness={22}
        nodeSpacing={40}
        nodeInnerPadding={4}
        nodeBorderWidth={0}
        nodeBorderRadius={4}
        linkOpacity={0.18}
        linkHoverOpacity={0.4}
        linkContract={2}
        enableLinkGradient
        labelPosition="outside"
        labelOrientation="horizontal"
        labelPadding={14}
        labelTextColor={{ from: "color", modifiers: [["darker", 1.2]] }}
        valueFormat={(v) => fmt.currency(v)}
        theme={{
          labels: {
            text: {
              fontSize: 11,
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fill: "var(--color-text-secondary)",
            },
          },
        }}
      />
    </div>
  )
}