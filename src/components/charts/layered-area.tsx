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

type Datum = { date: Date; revenue: number; claims: number }
type Props = { periods: Period[] }

export function LayeredAreaChart({ periods }: Props) {
  return (
    <div className="w-full h-[280px]" style={{ overflow: "visible" }}>
      <ParentSize>
        {({ width, height }) =>
          width > 0 ? <Inner width={width} height={height} periods={periods} /> : null
        }
      </ParentSize>
    </div>
  )
}

function Inner({ width, height, periods }: Props & { width: number; height: number }) {
  const data: Datum[] = useMemo(
    () =>
      periods
        .filter((p) => p.insuranceRevenue && p.incurredClaims)
        .map((p) => ({
          date: new Date(p.periodEnd),
          revenue: p.insuranceRevenue!,
          claims: p.incurredClaims!,
        })),
    [periods]
  )

  const margin = { top: 12, right: 200, bottom: 32, left: 56 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const xScale = useMemo(
    () => scaleTime({ range: [0, innerW], domain: extent(data, (d) => d.date) as [Date, Date] }),
    [data, innerW]
  )
  const yMax = (max(data, (d) => d.revenue) ?? 0) * 1.05
  const yScale = useMemo(
    () => scaleLinear({ range: [innerH, 0], domain: [0, yMax], nice: true }),
    [yMax, innerH]
  )

  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const last = data[data.length - 1]

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
        <GridRows
          scale={yScale}
          width={innerW}
          numTicks={4}
          stroke="rgba(10,31,68,0.07)"
          strokeDasharray="3,4"
        />

        <AreaClosed
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.revenue)}
          yScale={yScale}
          fill="url(#rev-fill)"
          curve={curveMonotoneX}
        />
        <AreaClosed
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.claims)}
          yScale={yScale}
          fill="url(#cla-fill)"
          curve={curveMonotoneX}
        />
        <LinePath
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.revenue)}
          stroke="var(--color-bupa-navy)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          curve={curveMonotoneX}
        />
        <LinePath
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.claims)}
          stroke="var(--color-bupa-blue)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          curve={curveMonotoneX}
        />

        {/* Hover overlay */}
        <rect
          width={innerW}
          height={innerH}
          fill="transparent"
          style={{ cursor: "crosshair" }}
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

        {/* Hover crosshair + dots */}
        {hoverIdx !== null && data[hoverIdx] && (
          <Group>
            <Line
              from={{ x: xScale(data[hoverIdx].date), y: 0 }}
              to={{ x: xScale(data[hoverIdx].date), y: innerH }}
              stroke="rgba(10,31,68,0.25)"
              strokeWidth={1}
              strokeDasharray="2,3"
            />
            <circle cx={xScale(data[hoverIdx].date)} cy={yScale(data[hoverIdx].revenue)} r={4.5}
              fill="var(--color-bupa-navy)" stroke="white" strokeWidth={2} />
            <circle cx={xScale(data[hoverIdx].date)} cy={yScale(data[hoverIdx].claims)} r={4.5}
              fill="var(--color-bupa-blue)" stroke="white" strokeWidth={2} />
          </Group>
        )}

        <AxisLeft
          scale={yScale}
          numTicks={4}
          stroke="transparent"
          tickStroke="transparent"
          tickFormat={(v) => `$${(Number(v) / 1e9).toFixed(0)}B`}
          tickLabelProps={{
            fill: "var(--color-text-secondary)",
            fontSize: 11,
            fontFamily: "var(--font-sans)",
            textAnchor: "end",
            dy: "0.32em",
            dx: "-0.5em",
          }}
        />
        <AxisBottom
          top={innerH}
          scale={xScale}
          numTicks={Math.min(data.length, 8)}
          stroke="rgba(10,31,68,0.12)"
          strokeWidth={1}
          tickStroke="transparent"
          tickLength={4}
          tickFormat={(d) =>
            (d as Date).toLocaleString("en-AU", { month: "short", year: "2-digit" })
          }
          tickLabelProps={{
            fill: "var(--color-text-secondary)",
            fontSize: 11,
            fontFamily: "var(--font-sans)",
            textAnchor: "middle",
            dy: "1em",
          }}
        />
      </Group>

      {/* Hover tooltip — flips left when in right half */}
      {hoverIdx !== null && data[hoverIdx] && (
        <foreignObject
          x={
            xScale(data[hoverIdx].date) > innerW / 2
              ? margin.left + xScale(data[hoverIdx].date) - 174
              : margin.left + xScale(data[hoverIdx].date) + 14
          }
          y={margin.top + 8}
          width={160}
          height={112}
          style={{ pointerEvents: "none", overflow: "visible" }}
        >
          <div style={{
            background: "var(--color-bupa-navy)",
            color: "#fff",
            borderRadius: "12px",
            padding: "10px 14px 14px",
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            boxShadow: "0 14px 30px -10px rgba(10,31,68,0.5)",
          }}>
            <div style={{ fontWeight: 600, marginBottom: "8px", opacity: 0.65, fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase" }}>
              {data[hoverIdx].date.toLocaleString("en-AU", { month: "short", year: "numeric" })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ opacity: 0.65 }}>Revenue</span>
              <span style={{ fontWeight: 500 }}>${(data[hoverIdx].revenue / 1e9).toFixed(2)}B</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", marginBottom: "4px", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ opacity: 0.65 }}>Claims</span>
              <span style={{ fontWeight: 500 }}>${(data[hoverIdx].claims / 1e9).toFixed(2)}B</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", paddingTop: "8px", marginTop: "4px", borderTop: "1px solid rgba(255,255,255,0.12)", fontVariantNumeric: "tabular-nums" }}>
              <span style={{ opacity: 0.65 }}>Margin</span>
              <span style={{ fontWeight: 500 }}>${((data[hoverIdx].revenue - data[hoverIdx].claims) / 1e9).toFixed(2)}B</span>
            </div>
          </div>
        </foreignObject>
      )}

      {/* Pinned callouts anchored to last data point on the lines */}
      {last && (
        <>
          <foreignObject
            x={margin.left + innerW + 12}
            y={margin.top + yScale(last.revenue) - 30}
            width={162}
            height={56}
            style={{ pointerEvents: "none", overflow: "visible" }}
          >
            <div style={{
              background: "var(--color-bupa-navy)",
              color: "#fff",
              borderRadius: "12px",
              padding: "8px 12px",
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              fontWeight: 600,
              boxShadow: "0 14px 30px -10px rgba(10,31,68,0.5)",
            }}>
              <div style={{ opacity: 0.65, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2px" }}>
                Revenue · {last.date.toLocaleString("en-AU", { month: "short", year: "numeric" })}
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "26px", fontStyle: "normal", fontWeight: 800, letterSpacing: "-0.03em", fontVariationSettings: '"opsz" 144, "SOFT" 20' }}>
  ${(last.revenue / 1e9).toFixed(2)}B
</div>
            </div>
          </foreignObject>

          <foreignObject
            x={margin.left + innerW + 12}
            y={margin.top + yScale(last.claims) + 8}
            width={162}
            height={56}
            style={{ pointerEvents: "none", overflow: "visible" }}
          >
            <div style={{
              background: "var(--color-bupa-blue)",
              color: "#fff",
              borderRadius: "12px",
              padding: "8px 12px",
              fontFamily: "var(--font-sans)",
              fontSize: "10px",
              fontWeight: 600,
              boxShadow: "0 14px 30px -10px rgba(10,31,68,0.5)",
            }}>
              <div style={{ opacity: 0.65, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2px" }}>
                Claims · {last.date.toLocaleString("en-AU", { month: "short", year: "numeric" })}
              </div>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "26px", fontStyle: "normal", fontWeight: 800, letterSpacing: "-0.03em", fontVariationSettings: '"opsz" 144, "SOFT" 20' }}>
  ${(last.claims / 1e9).toFixed(2)}B
</div>
            </div>
          </foreignObject>

          {/* Endpoint dots on lines */}
          <circle
            cx={margin.left + innerW}
            cy={margin.top + yScale(last.revenue)}
            r={4.5}
            fill="var(--color-bupa-navy)"
            stroke="white"
            strokeWidth={2}
          />
          <circle
            cx={margin.left + innerW}
            cy={margin.top + yScale(last.claims)}
            r={4.5}
            fill="var(--color-bupa-blue)"
            stroke="white"
            strokeWidth={2}
          />
        </>
      )}
    </svg>
  )
}