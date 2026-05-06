"use client"

import { motion } from "framer-motion"
import { ParentSize } from "@visx/responsive"
import { Group } from "@visx/group"
import { scaleBand, scaleLinear } from "@visx/scale"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { GridRows } from "@visx/grid"
import type { WaterfallStep } from "@/lib/data/transforms"
import { duration, easing } from "@/lib/motion"
import { fmt } from "@/lib/format"

type Props = {
  steps: WaterfallStep[]
}

export function WaterfallChart({ steps }: Props) {
  return (
    <div className="w-full h-[280px]">
      <ParentSize>
        {({ width, height }) =>
          width > 0 ? <Inner width={width} height={height} steps={steps} /> : null
        }
      </ParentSize>
    </div>
  )
}

function Inner({ width, height, steps }: Props & { width: number; height: number }) {
  const margin = { top: 24, right: 16, bottom: 32, left: 64 }
  const innerW = width - margin.left - margin.right
  const innerH = height - margin.top - margin.bottom

  const max = Math.max(...steps.map((s) => s.cumulative)) * 1.05
  const min = Math.min(0, Math.min(...steps.map((s) => s.cumulative)) * 0.95)

  const xScale = scaleBand({
    range: [0, innerW],
    domain: steps.map((s, i) => `${i}`),
    padding: 0.4,
  })
  const yScale = scaleLinear({
    range: [innerH, 0],
    domain: [min, max],
    nice: true,
  })

  const colourFor = (type: WaterfallStep["type"]) => {
    if (type === "start" || type === "end") return "var(--color-chart-1)"
    if (type === "increase") return "var(--color-positive)"
    return "var(--color-negative)"
  }

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

        {steps.map((step, i) => {
          const x = xScale(`${i}`) ?? 0
          const w = xScale.bandwidth()

          // Determine bar geometry
          let barTop: number
          let barBottom: number

          if (step.type === "start" || step.type === "end") {
            barTop = yScale(step.cumulative)
            barBottom = yScale(0)
          } else {
            const startY = yScale(step.cumulative - step.value)
            const endY = yScale(step.cumulative)
            barTop = Math.min(startY, endY)
            barBottom = Math.max(startY, endY)
          }

          const barHeight = Math.max(2, barBottom - barTop)

          // Connector line to next bar
          const next = steps[i + 1]
          const connectorX = x + w
          const connectorEndX = next ? (xScale(`${i + 1}`) ?? 0) : null
          const connectorY = yScale(step.cumulative)

          return (
            <Group key={i}>
              {connectorEndX !== null && (
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: duration.default,
                    delay: 0.1 + i * 0.08,
                    ease: easing.product,
                  }}
                  x1={connectorX}
                  y1={connectorY}
                  x2={connectorEndX}
                  y2={connectorY}
                  stroke="var(--color-text-tertiary)"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                  strokeOpacity={0.5}
                />
              )}
              <motion.rect
                initial={{ height: 0, y: yScale(0) }}
                animate={{ height: barHeight, y: barTop }}
                transition={{
                  duration: duration.chart,
                  delay: i * 0.08,
                  ease: easing.product,
                }}
                x={x}
                width={w}
                rx={2}
                fill={colourFor(step.type)}
                opacity={step.type === "start" || step.type === "end" ? 1 : 0.85}
              />

              {/* Value label above bar */}
              <motion.text
                initial={{ opacity: 0, y: barTop + 4 }}
                animate={{ opacity: 1, y: barTop - 6 }}
                transition={{
                  duration: duration.default,
                  delay: 0.3 + i * 0.08,
                  ease: easing.product,
                }}
                x={x + w / 2}
                textAnchor="middle"
                fontSize={10}
                fill="var(--color-text-secondary)"
                className="tabular"
              >
                {step.type === "start" || step.type === "end"
                  ? fmt.currency(step.value)
                  : `${step.value > 0 ? "+" : ""}${fmt.currency(step.value)}`}
              </motion.text>
            </Group>
          )
        })}

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
          stroke="var(--color-border-default)"
          strokeWidth={1}
          tickStroke="var(--color-border-default)"
          tickLength={4}
          tickFormat={(v) => steps[Number(v)].label}
          tickLabelProps={() => ({
            fill: "var(--color-text-secondary)",
            fontSize: 11,
            textAnchor: "middle",
            dy: "0.5em",
          })}
        />
      </Group>
    </svg>
  )
}