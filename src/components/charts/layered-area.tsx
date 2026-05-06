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

type Datum = {
  date: Date
  revenue: number
  claims: number
}

type Props = {
  periods: Period[]
}

export function LayeredAreaChart({ periods }: Props) {
  return (
    <div className="w-full h-[260px]">
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

  const margin = { top: 12, right: 16, bottom: 28, left: 56 }
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

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <GridRows
          scale={yScale}
          width={innerW}
          numTicks={4}
          stroke="var(--color-border-subtle)"
          strokeDasharray="3,3"
          strokeOpacity={0.7}
        />

        {/* Revenue area — sits behind */}
        <AreaClosed
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.revenue)}
          yScale={yScale}
          fill="var(--color-chart-1)"
          fillOpacity={0.1}
          curve={curveMonotoneX}
        />
        {/* Claims area — sits in front, smaller, creates the visible gap */}
        <AreaClosed
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.claims)}
          yScale={yScale}
          fill="var(--color-chart-2)"
          fillOpacity={0.18}
          curve={curveMonotoneX}
        />

        {/* Lines on top */}
        <LinePath
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.revenue)}
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          curve={curveMonotoneX}
        />
        <LinePath
          data={data}
          x={(d) => xScale(d.date)}
          y={(d) => yScale(d.claims)}
          stroke="var(--color-chart-2)"
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
          onMouseMove={(e) => {
            const { left } = (e.target as SVGRectElement).getBoundingClientRect()
            const x = e.clientX - left
            // Find nearest datum
            let closest = 0
            let minDist = Infinity
            data.forEach((d, i) => {
              const dist = Math.abs(xScale(d.date) - x)
              if (dist < minDist) {
                minDist = dist
                closest = i
              }
            })
            setHoverIdx(closest)
          }}
          onMouseLeave={() => setHoverIdx(null)}
        />

        {hoverIdx !== null && data[hoverIdx] && (
          <Group>
            <Line
              from={{ x: xScale(data[hoverIdx].date), y: 0 }}
              to={{ x: xScale(data[hoverIdx].date), y: innerH }}
              stroke="var(--color-text-tertiary)"
              strokeWidth={1}
              strokeDasharray="2,3"
            />
            <circle
              cx={xScale(data[hoverIdx].date)}
              cy={yScale(data[hoverIdx].revenue)}
              r={4}
              fill="var(--color-chart-1)"
              stroke="var(--color-surface)"
              strokeWidth={1.5}
            />
            <circle
              cx={xScale(data[hoverIdx].date)}
              cy={yScale(data[hoverIdx].claims)}
              r={4}
              fill="var(--color-chart-2)"
              stroke="var(--color-surface)"
              strokeWidth={1.5}
            />
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
            textAnchor: "end",
            dy: "0.32em",
            dx: "-0.5em",
          }}
        />
        <AxisBottom
          top={innerH}
          scale={xScale}
          numTicks={Math.min(data.length, 6)}
          stroke="var(--color-border-default)"
          strokeWidth={1}
          tickStroke="var(--color-border-default)"
          tickLength={4}
          tickFormat={(d) =>
            (d as Date).toLocaleString("en-AU", { month: "short", year: "2-digit" })
          }
          tickLabelProps={{
            fill: "var(--color-text-secondary)",
            fontSize: 11,
            textAnchor: "middle",
            dy: "0.5em",
          }}
        />
      </Group>

      {/* Tooltip */}
      {hoverIdx !== null && data[hoverIdx] && (
        <foreignObject
          x={Math.min(margin.left + xScale(data[hoverIdx].date) + 12, width - 180)}
          y={margin.top + 4}
          width={170}
          height={88}
          style={{ pointerEvents: "none" }}
        >
          <div className="bg-inverse text-text-inverse rounded-lg px-3 py-2 text-caption">
            <div className="font-medium mb-1">
              {data[hoverIdx].date.toLocaleString("en-AU", {
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className="flex items-center justify-between gap-2 tabular">
              <span className="opacity-70">Revenue</span>
              <span>${(data[hoverIdx].revenue / 1e9).toFixed(2)}B</span>
            </div>
            <div className="flex items-center justify-between gap-2 tabular">
              <span className="opacity-70">Claims</span>
              <span>${(data[hoverIdx].claims / 1e9).toFixed(2)}B</span>
            </div>
            <div className="flex items-center justify-between gap-2 tabular pt-1 mt-1 border-t border-white/10">
              <span className="opacity-70">Gross margin</span>
              <span>${((data[hoverIdx].revenue - data[hoverIdx].claims) / 1e9).toFixed(2)}B</span>
            </div>
          </div>
        </foreignObject>
      )}
    </svg>
  )
}