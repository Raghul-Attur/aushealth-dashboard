"use client"

import { Group } from "@visx/group"
import { AreaClosed, Line, LinePath } from "@visx/shape"
import { scaleLinear, scaleTime } from "@visx/scale"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { GridRows } from "@visx/grid"
import { ParentSize } from "@visx/responsive"
import { curveMonotoneX } from "@visx/curve"
import { extent, max } from "d3-array"
import { useMemo, useState } from "react"
import type { Period } from "@/lib/data/schemas"

export type ViewMode = "quarterly" | "ttm" | "yoy"

type Datum = { date: Date; revenue: number; claims: number }

type Props = {
  periods: Period[]
  view?: ViewMode
  showPriorYear?: boolean
}

function buildData(periods: Period[], view: ViewMode): Datum[] {
  return periods
    .filter((p) => {
      if (view === "quarterly") return p.insuranceRevenue && p.incurredClaims
      if (view === "ttm") return p.ttmRevenue && p.ttmClaims
      if (view === "yoy") return p.revenueYoY !== undefined
      return false
    })
    .map((p) => {
      const date = new Date(p.periodEnd)
      if (view === "quarterly") return { date, revenue: p.insuranceRevenue!, claims: p.incurredClaims! }
      if (view === "ttm") return { date, revenue: p.ttmRevenue!, claims: p.ttmClaims! }
      const revenueYoY = (p.revenueYoY ?? 0) * 100
      const claimsProxy = revenueYoY + ((p.lossRatio ?? 0) - 0.84) * 100
      return { date, revenue: revenueYoY, claims: claimsProxy }
    })
}

export function LayeredAreaChart({ periods, view = "quarterly", showPriorYear = false }: Props) {
  return (
    <div className="w-full h-[280px]" style={{ overflow: "visible" }}>
      <ParentSize>
        {({ width, height }) =>
          width > 0 ? <Inner width={width} height={height} periods={periods} view={view} showPriorYear={showPriorYear} /> : null
        }
      </ParentSize>
    </div>
  )
}

function Inner({ width, height, periods, view, showPriorYear }: Props & { width: number; height: number; view: ViewMode; showPriorYear: boolean }) {
  const data = useMemo(() => buildData(periods, view), [periods, view])

  // Prior year data — shift dates forward by 1 year for overlay alignment
  const priorYearData = useMemo(() => {
    if (!showPriorYear || view === "yoy") return []
    const half = Math.floor(periods.length / 2)
    const priorPeriods = periods.slice(0, half)
    return buildData(priorPeriods, view).map((d) => ({
      ...d,
      date: new Date(d.date.getFullYear() + 1, d.date.getMonth(), d.date.getDate()),
    }))
  }, [periods, view, showPriorYear])

  const margin = { top: 12, right: 220, bottom: 32, left: view === "yoy" ? 48 : 56 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const allData = [...data, ...priorYearData]

  const xScale = useMemo(
    () => scaleTime({ range: [0, innerW], domain: extent(allData, (d) => d.date) as [Date, Date] }),
    [allData, innerW]
  )

  const yMax = (max(allData, (d) => Math.max(d.revenue, d.claims)) ?? 0) * (view === "yoy" ? 1.3 : 1.05)
  const yMin = view === "yoy" ? Math.min(0, ...allData.map((d) => Math.min(d.revenue, d.claims))) * 1.2 : 0

  const yScale = useMemo(
    () => scaleLinear({ range: [innerH, 0], domain: [yMin, yMax], nice: true }),
    [yMax, yMin, innerH]
  )

  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const last = data[data.length - 1]

  const yAxisFormat = view === "yoy"
    ? (v: unknown) => `${Number(v) > 0 ? "+" : ""}${Number(v).toFixed(1)}%`
    : (v: unknown) => `$${(Number(v) / 1e9).toFixed(0)}B`

  const tooltipRevLabel = view === "yoy" ? "Rev YoY" : "Revenue"
  const tooltipClmLabel = view === "yoy" ? "Claims proxy" : "Claims"
  const tooltipFormat = (v: number) =>
    view === "yoy" ? `${v > 0 ? "+" : ""}${v.toFixed(2)}%` : `$${(v / 1e9).toFixed(2)}B`

  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="rev-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-bupa-navy)" stopOpacity={0.22} />
          <stop offset="100%" stopColor="var(--color-bupa-navy)" stopOpacity={0.02} />
        </linearGradient>
        <linearGradient id="cla-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-bupa-blue)" stopOpacity={0.28} />
          <stop offset="100%" stopColor="var(--color-bupa-blue)" stopOpacity={0.02} />
        </linearGradient>
      </defs>

      <Group left={margin.left} top={margin.top}>
        <GridRows scale={yScale} width={innerW} numTicks={4}
          stroke="rgba(0,47,108,0.07)" strokeDasharray="3,4" />

        {view === "yoy" && (
          <line x1={0} x2={innerW} y1={yScale(0)} y2={yScale(0)}
            stroke="rgba(0,47,108,0.2)" strokeWidth={1} strokeDasharray="4,3" />
        )}

        {/* Current year fills */}
        <AreaClosed data={data} x={(d) => xScale(d.date)} y={(d) => yScale(d.revenue)}
          yScale={yScale} fill="url(#rev-fill)" curve={curveMonotoneX} />
        <AreaClosed data={data} x={(d) => xScale(d.date)} y={(d) => yScale(d.claims)}
          yScale={yScale} fill="url(#cla-fill)" curve={curveMonotoneX} />

        {/* Current year lines */}
        <LinePath data={data} x={(d) => xScale(d.date)} y={(d) => yScale(d.revenue)}
          stroke="var(--color-bupa-navy)" strokeWidth={2.5}
          strokeLinecap="round" strokeLinejoin="round" curve={curveMonotoneX} />
        <LinePath data={data} x={(d) => xScale(d.date)} y={(d) => yScale(d.claims)}
          stroke="var(--color-bupa-blue)" strokeWidth={2.5}
          strokeLinecap="round" strokeLinejoin="round" curve={curveMonotoneX} />

        {/* Prior year overlay — dashed, muted */}
        {showPriorYear && priorYearData.length > 0 && (
          <>
            <LinePath data={priorYearData} x={(d) => xScale(d.date)} y={(d) => yScale(d.revenue)}
              stroke="var(--color-bupa-navy)" strokeWidth={1.5} strokeOpacity={0.35}
              strokeDasharray="5,4" strokeLinecap="round" curve={curveMonotoneX} />
            <LinePath data={priorYearData} x={(d) => xScale(d.date)} y={(d) => yScale(d.claims)}
              stroke="var(--color-bupa-blue)" strokeWidth={1.5} strokeOpacity={0.35}
              strokeDasharray="5,4" strokeLinecap="round" curve={curveMonotoneX} />
          </>
        )}

        {/* Hover overlay */}
        <rect width={innerW} height={innerH} fill="transparent" style={{ cursor: "crosshair" }}
          onMouseMove={(e) => {
            const { left } = (e.target as SVGRectElement).getBoundingClientRect()
            const x = e.clientX - left
            let closest = 0, minDist = Infinity
            data.forEach((d, i) => {
              const dist = Math.abs(xScale(d.date) - x)
              if (dist < minDist) { minDist = dist; closest = i }
            })
            setHoverIdx(closest)
          }}
          onMouseLeave={() => setHoverIdx(null)}
        />

        {hoverIdx !== null && data[hoverIdx] && (
          <Group>
            <Line from={{ x: xScale(data[hoverIdx].date), y: 0 }}
              to={{ x: xScale(data[hoverIdx].date), y: innerH }}
              stroke="rgba(0,47,108,0.25)" strokeWidth={1} strokeDasharray="2,3" />
            <circle cx={xScale(data[hoverIdx].date)} cy={yScale(data[hoverIdx].revenue)}
              r={4.5} fill="var(--color-bupa-navy)" stroke="white" strokeWidth={2} />
            <circle cx={xScale(data[hoverIdx].date)} cy={yScale(data[hoverIdx].claims)}
              r={4.5} fill="var(--color-bupa-blue)" stroke="white" strokeWidth={2} />
            {/* Show prior year dots at same x position */}
            {showPriorYear && priorYearData[hoverIdx] && (
              <>
                <circle cx={xScale(data[hoverIdx].date)} cy={yScale(priorYearData[hoverIdx].revenue)}
                  r={3} fill="var(--color-bupa-navy)" fillOpacity={0.4} stroke="white" strokeWidth={1.5} />
                <circle cx={xScale(data[hoverIdx].date)} cy={yScale(priorYearData[hoverIdx].claims)}
                  r={3} fill="var(--color-bupa-blue)" fillOpacity={0.4} stroke="white" strokeWidth={1.5} />
              </>
            )}
          </Group>
        )}

        <AxisLeft scale={yScale} numTicks={4} stroke="transparent" tickStroke="transparent"
          tickFormat={yAxisFormat}
          tickLabelProps={{ fill: "var(--color-text-secondary)", fontSize: 11, fontFamily: "var(--font-sans)", textAnchor: "end", dy: "0.32em", dx: "-0.5em" }} />
        <AxisBottom top={innerH} scale={xScale} numTicks={Math.min(data.length, 8)}
          stroke="rgba(0,47,108,0.12)" strokeWidth={1} tickStroke="transparent" tickLength={4}
          tickFormat={(d) => (d as Date).toLocaleString("en-AU", { month: "short", year: "2-digit" })}
          tickLabelProps={{ fill: "var(--color-text-secondary)", fontSize: 11, fontFamily: "var(--font-sans)", textAnchor: "middle", dy: "1em" }} />
      </Group>

      {/* Hover tooltip */}
      {hoverIdx !== null && data[hoverIdx] && (
        <foreignObject
          x={xScale(data[hoverIdx].date) > innerW / 2
            ? margin.left + xScale(data[hoverIdx].date) - 174
            : margin.left + xScale(data[hoverIdx].date) + 14}
          y={margin.top + 8} width={170} height={showPriorYear ? 148 : 112}
          style={{ pointerEvents: "none", overflow: "visible" }}>
          <div style={{
            background: "var(--color-bupa-navy)", color: "#fff",
            borderRadius: "12px", padding: "10px 14px 14px",
            fontFamily: "var(--font-sans)", fontSize: "12px",
            boxShadow: "0 14px 30px -10px rgba(0,47,108,0.5)",
          }}>
            <div style={{ fontWeight: 600, marginBottom: "8px", opacity: 0.65, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {data[hoverIdx].date.toLocaleString("en-AU", { month: "short", year: "numeric" })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ opacity: 0.65 }}>{tooltipRevLabel}</span>
              <span style={{ fontWeight: 500 }}>{tooltipFormat(data[hoverIdx].revenue)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ opacity: 0.65 }}>{tooltipClmLabel}</span>
              <span style={{ fontWeight: 500 }}>{tooltipFormat(data[hoverIdx].claims)}</span>
            </div>
            {view !== "yoy" && (
              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", paddingTop: "8px", marginTop: "4px", borderTop: "1px solid rgba(255,255,255,0.12)", fontVariantNumeric: "tabular-nums" }}>
                <span style={{ opacity: 0.65 }}>Margin</span>
                <span style={{ fontWeight: 500 }}>${((data[hoverIdx].revenue - data[hoverIdx].claims) / 1e9).toFixed(2)}B</span>
              </div>
            )}
            {showPriorYear && priorYearData[hoverIdx] && (
              <div style={{ paddingTop: "8px", marginTop: "4px", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                <div style={{ opacity: 0.5, fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Prior year</div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontVariantNumeric: "tabular-nums", opacity: 0.7 }}>
                  <span style={{ opacity: 0.65 }}>{tooltipRevLabel}</span>
                  <span>{tooltipFormat(priorYearData[hoverIdx].revenue)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", fontVariantNumeric: "tabular-nums", opacity: 0.7 }}>
                  <span style={{ opacity: 0.65 }}>{tooltipClmLabel}</span>
                  <span>{tooltipFormat(priorYearData[hoverIdx].claims)}</span>
                </div>
              </div>
            )}
          </div>
        </foreignObject>
      )}

      {/* Pinned callouts */}
      {last && (
        <>
          <foreignObject x={margin.left + innerW + 16}
            y={margin.top + yScale(last.revenue) - 34}
            width={168} height={62} style={{ pointerEvents: "none", overflow: "visible" }}>
            <div style={{
              background: "var(--color-bupa-navy)", color: "#fff",
              borderRadius: "12px", padding: "8px 12px",
              fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 600,
              boxShadow: "0 14px 30px -10px rgba(0,47,108,0.5)",
            }}>
              <div style={{ opacity: 0.65, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2px" }}>
                {tooltipRevLabel} · {last.date.toLocaleString("en-AU", { month: "short", year: "numeric" })}
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.03em" }}>
                {tooltipFormat(last.revenue)}
              </div>
            </div>
          </foreignObject>

          <foreignObject x={margin.left + innerW + 16}
            y={margin.top + yScale(last.claims) + 8}
            width={168} height={62} style={{ pointerEvents: "none", overflow: "visible" }}>
            <div style={{
              background: "var(--color-bupa-blue)", color: "#fff",
              borderRadius: "12px", padding: "8px 12px",
              fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 600,
              boxShadow: "0 14px 30px -10px rgba(0,47,108,0.5)",
            }}>
              <div style={{ opacity: 0.65, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2px" }}>
                {tooltipClmLabel} · {last.date.toLocaleString("en-AU", { month: "short", year: "numeric" })}
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "22px", fontWeight: 800, letterSpacing: "-0.03em" }}>
                {tooltipFormat(last.claims)}
              </div>
            </div>
          </foreignObject>

          <circle cx={margin.left + innerW} cy={margin.top + yScale(last.revenue)}
            r={4.5} fill="var(--color-bupa-navy)" stroke="white" strokeWidth={2} />
          <circle cx={margin.left + innerW} cy={margin.top + yScale(last.claims)}
            r={4.5} fill="var(--color-bupa-blue)" stroke="white" strokeWidth={2} />
        </>
      )}
    </svg>
  )
}