"use client"

import { motion } from "framer-motion"
import { ParentSize } from "@visx/responsive"
import { useState } from "react"
import { duration, easing } from "@/lib/motion"
import type { AgeBand } from "@/lib/data/schemas"
import { fmt } from "@/lib/format"

type Props = {
  data: AgeBand[]
}

export function PopulationPyramid({ data }: Props) {
  return (
    <div className="w-full h-[360px]">
      <ParentSize>
        {({ width, height }) =>
          width > 0 ? <Inner width={width} height={height} data={data} /> : null
        }
      </ParentSize>
    </div>
  )
}

function Inner({ width, height, data }: Props & { width: number; height: number }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const margin = { top: 16, right: 16, bottom: 28, left: 16 }
  const labelGap = 56
  const innerW = width - margin.left - margin.right - labelGap
  const innerH = height - margin.top - margin.bottom

  const halfW = innerW / 2
  const centerX = margin.left + halfW + labelGap / 2

  const maxValue = Math.max(...data.map((d) => Math.max(d.male, d.female)))
  const barHeight = Math.max(8, (innerH / data.length) - 2)

  // Reverse so older bands render at top (canonical population pyramid orientation)
  const ordered = [...data].reverse()

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Center axis */}
      <line
        x1={centerX}
        x2={centerX}
        y1={margin.top}
        y2={height - margin.bottom}
        stroke="var(--color-border-default)"
        strokeWidth={1}
      />

      {ordered.map((band, i) => {
        const y = margin.top + i * (barHeight + 2)
        const maleW = (band.male / maxValue) * (halfW - labelGap / 2)
        const femaleW = (band.female / maxValue) * (halfW - labelGap / 2)
        const isHovered = hoverIdx === i

        return (
          <g
            key={band.ageBand}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            style={{ cursor: "pointer" }}
          >
            {/* Hover hit area */}
            <rect
              x={margin.left}
              y={y - 1}
              width={innerW + labelGap}
              height={barHeight + 2}
              fill="transparent"
            />

            {/* Male bar (left) */}
            <motion.rect
              initial={{ width: 0 }}
              animate={{ width: maleW }}
              transition={{
                duration: duration.chart,
                delay: i * 0.025,
                ease: easing.product,
              }}
              x={centerX - labelGap / 2 - maleW}
              y={y}
              height={barHeight}
              fill="var(--color-chart-1)"
              fillOpacity={isHovered ? 0.95 : 0.75}
              rx={2}
            />

            {/* Female bar (right) */}
            <motion.rect
              initial={{ width: 0 }}
              animate={{ width: femaleW }}
              transition={{
                duration: duration.chart,
                delay: i * 0.025,
                ease: easing.product,
              }}
              x={centerX + labelGap / 2}
              y={y}
              height={barHeight}
              fill="var(--color-chart-2)"
              fillOpacity={isHovered ? 0.95 : 0.75}
              rx={2}
            />

            {/* Age band label (centered between bars) */}
            <text
              x={centerX}
              y={y + barHeight / 2 + 3}
              textAnchor="middle"
              fontSize={10}
              fill={isHovered ? "var(--color-text-primary)" : "var(--color-text-secondary)"}
              className="tabular"
            >
              {band.ageBand}
            </text>
          </g>
        )
      })}

      {/* Axis labels (M / F) */}
      <text
        x={margin.left}
        y={height - 8}
        fontSize={11}
        fill="var(--color-text-tertiary)"
        textAnchor="start"
      >
        ◀ Male
      </text>
      <text
        x={width - margin.right}
        y={height - 8}
        fontSize={11}
        fill="var(--color-text-tertiary)"
        textAnchor="end"
      >
        Female ▶
      </text>

      {/* Hover tooltip */}
      {hoverIdx !== null && ordered[hoverIdx] && (
        <foreignObject
          x={margin.left + 8}
          y={Math.max(margin.top, hoverIdx * (barHeight + 2) - 30)}
          width={200}
          height={70}
          style={{ pointerEvents: "none" }}
        >
          <div className="bg-inverse text-text-inverse rounded-lg px-3 py-2 text-caption">
            <div className="font-medium mb-1">Age {ordered[hoverIdx].ageBand}</div>
            <div className="flex justify-between gap-4 tabular">
              <span className="opacity-70">Male</span>
              <span>{fmt.number(ordered[hoverIdx].male)}</span>
            </div>
            <div className="flex justify-between gap-4 tabular">
              <span className="opacity-70">Female</span>
              <span>{fmt.number(ordered[hoverIdx].female)}</span>
            </div>
          </div>
        </foreignObject>
      )}
    </svg>
  )
}