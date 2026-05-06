"use client"

import { ParentSize } from "@visx/responsive"
import { Group } from "@visx/group"
import { AreaStack } from "@visx/shape"
import { scaleLinear, scaleTime } from "@visx/scale"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { GridRows } from "@visx/grid"
import { curveMonotoneX } from "@visx/curve"
import { extent, max } from "d3-array"
import { useMemo } from "react"
import type { ProfitComposition } from "@/lib/data/transforms"

type Props = {
  data: ProfitComposition[]
}

export function ProfitCompositionChart({ data }: Props) {
  return (
    <div className="w-full h-[200px]">
      <ParentSize>
        {({ width, height }) =>
          width > 0 ? <Inner width={width} height={height} data={data} /> : null
        }
      </ParentSize>
    </div>
  )
}

const keys = ["underwritingProfit", "investmentProfit"] as const

function Inner({ width, height, data }: Props & { width: number; height: number }) {
  const margin = { top: 16, right: 16, bottom: 28, left: 56 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const stacked = useMemo(
    () =>
      data.map((d) => ({
        date: new Date(d.periodEnd),
        underwritingProfit: Math.max(0, d.underwritingProfit),
        investmentProfit: Math.max(0, d.investmentProfit),
        total: Math.max(0, d.underwritingProfit) + Math.max(0, d.investmentProfit),
      })),
    [data]
  )

  const xScale = scaleTime({
    range: [0, innerW],
    domain: extent(stacked, (d) => d.date) as [Date, Date],
  })
  const yMax = (max(stacked, (d) => d.total) ?? 0) * 1.1
  const yScale = scaleLinear({ range: [innerH, 0], domain: [0, yMax], nice: true })

  const colours = {
    underwritingProfit: "var(--color-chart-1)",
    investmentProfit: "var(--color-chart-2)",
  }

  return (
    <svg width={width} height={height}>
      <Group left={margin.left} top={margin.top}>
        <GridRows
          scale={yScale}
          width={innerW}
          numTicks={3}
          stroke="var(--color-border-subtle)"
          strokeDasharray="3,3"
          strokeOpacity={0.7}
        />
        <AreaStack
          data={stacked}
          keys={keys as unknown as string[]}
          x={(d) => xScale(d.data.date)}
          y0={(d) => yScale(d[0])}
          y1={(d) => yScale(d[1])}
          curve={curveMonotoneX}
        >
          {({ stacks, path }) =>
            stacks.map((stack) => (
              <path
                key={stack.key}
                d={path(stack) ?? ""}
                fill={colours[stack.key as keyof typeof colours]}
                fillOpacity={0.7}
                stroke={colours[stack.key as keyof typeof colours]}
                strokeWidth={1}
              />
            ))
          }
        </AreaStack>
        <AxisLeft
          scale={yScale}
          numTicks={3}
          stroke="transparent"
          tickStroke="transparent"
          tickFormat={(v) => `$${(Number(v) / 1e9).toFixed(1)}B`}
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
          numTicks={Math.min(stacked.length, 5)}
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
    </svg>
  )
}