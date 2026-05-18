"use client"

import { ResponsiveLine } from "@nivo/line"

type Period = {
  periodLabel: string
  revenue: number
  netProfit: number
  lossRatio: number
  netMargin: number
}

type Props = {
  bupa: Period[]
  medibank: Period[]
}

type ViewMode = "revenue" | "netMargin" | "lossRatio"

import { useState } from "react"
import { fmt } from "@/lib/format"

export function CompetitorTimeline({ bupa, medibank }: Props) {
  const [view, setView] = useState<ViewMode>("revenue")

  const views: { key: ViewMode; label: string }[] = [
    { key: "revenue", label: "Revenue" },
    { key: "netMargin", label: "Net margin" },
    { key: "lossRatio", label: "Loss ratio" },
  ]

  const buildSeries = (view: ViewMode) => [
    {
      id: "Bupa",
      color: "#0079C8",
      data: bupa.map((p) => ({
        x: p.periodLabel,
        y: view === "revenue" ? +(p.revenue / 1e9).toFixed(2)
          : view === "netMargin" ? +(p.netMargin * 100).toFixed(1)
          : +(p.lossRatio * 100).toFixed(1),
      })),
    },
    {
      id: "Medibank",
      color: "#00857C",
      data: medibank.map((p) => ({
        x: p.periodLabel,
        y: view === "revenue" ? +(p.revenue / 1e9).toFixed(2)
          : view === "netMargin" ? +(p.netMargin * 100).toFixed(1)
          : +(p.lossRatio * 100).toFixed(1),
      })),
    },
  ]

  const yFormat = view === "revenue"
    ? (v: unknown) => `$${v}B`
    : (v: unknown) => `${v}%`

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center gap-1 mb-4 rounded-full p-0.5 w-fit"
        style={{ background: "rgba(0,47,108,0.06)", border: "1px solid rgba(0,47,108,0.08)" }}>
        {views.map(({ key, label }) => (
          <button key={key} type="button" onClick={() => setView(key)}
            className="px-3 py-1.5 rounded-full font-sans text-[12px] font-medium transition-all"
            style={{
              background: view === key ? "var(--color-bupa-navy)" : "transparent",
              color: view === key ? "#fff" : "var(--color-text-tertiary)",
            }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ height: 260 }}>
        <ResponsiveLine
          data={buildSeries(view)}
          margin={{ top: 12, right: 80, bottom: 40, left: 52 }}
          xScale={{ type: "point" }}
          yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
          curve="monotoneX"
          axisBottom={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 8,
            format: yFormat,
          }}
          colors={["#0079C8", "#00857C"]}
          lineWidth={2.5}
          pointSize={8}
          pointColor="#ffffff"
        pointBorderWidth={2.5}
        pointBorderColor={["#0079C8", "#00857C"] as any}
          enableArea
          areaOpacity={0.08}
          useMesh
          enableGridX={false}
          enableGridY
          gridYValues={4}
          legends={[
            {
              anchor: "right",
              direction: "column",
              justify: false,
              translateX: 76,
              translateY: 0,
              itemsSpacing: 8,
              itemDirection: "left-to-right",
              itemWidth: 70,
              itemHeight: 18,
              symbolSize: 10,
              symbolShape: "circle",
            },
          ]}
          theme={{
            axis: {
              ticks: { text: { fontSize: 11, fontFamily: "var(--font-sans)", fill: "var(--color-text-tertiary)" } },
            },
            grid: { line: { stroke: "rgba(0,47,108,0.07)", strokeDasharray: "3,4" } },
          }}
          tooltip={({ point }) => (
            <div style={{
              background: "var(--color-bupa-navy)", color: "#fff",
              borderRadius: "10px", padding: "8px 12px",
              fontFamily: "var(--font-sans)", fontSize: "12px",
              boxShadow: "0 8px 24px -6px rgba(0,47,108,0.4)",
            }}>
              <div style={{ fontWeight: 700, marginBottom: "2px" }}>{point.serieId}</div>
              <div style={{ opacity: 0.75 }}>{point.data.xFormatted}: {yFormat(point.data.yFormatted)}</div>
            </div>
          )}
        />
      </div>
    </div>
  )
}