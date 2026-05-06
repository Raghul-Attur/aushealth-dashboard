"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { duration, easing } from "@/lib/motion"

type Props = {
  values: number[]
  width?: number
  height?: number
  expandedWidth?: number
  expandedHeight?: number
  labels?: string[]
  static?: boolean
  inverse?: boolean
}

export function Sparkline({
  values,
  width = 80,
  height = 24,
  expandedWidth = 160,
  expandedHeight = 48,
  labels,
  static: isStatic = false,
  inverse = false,
}: Props) {
  const [hovered, setHovered] = useState(false)
  const expanded = hovered && !isStatic

  if (values.length < 2) return null

  const w = expanded ? expandedWidth : width
  const h = expanded ? expandedHeight : height

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const padY = expanded ? 8 : 2
  const padX = expanded ? 6 : 0

  const points = values.map((v, i) => {
    const x = padX + (i / (values.length - 1)) * (w - padX * 2)
    const y = h - padY - ((v - min) / range) * (h - padY * 2)
    return [x, y] as const
  })

  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ")

  const last = points[points.length - 1]
  const first = points[0]
  const trendUp = values[values.length - 1] > values[0]
  const trendIsGood = inverse ? !trendUp : trendUp
  const dotColour = trendIsGood ? "var(--color-positive)" : "var(--color-negative)"

  const areaPath =
    path +
    ` L${last[0].toFixed(1)},${(h - padY).toFixed(1)} L${first[0].toFixed(1)},${(h - padY).toFixed(1)} Z`

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex-shrink-0"
      style={{ width, height }}
    >
      {/* Compact baseline — always present, fades when expanded */}
      <motion.div
        className="absolute right-0 bottom-0"
        animate={{ opacity: expanded ? 0 : 1 }}
        transition={{ duration: duration.fast }}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="overflow-visible"
          aria-hidden
        >
          <path
            d={values
              .map((v, i) => {
                const x = (i / (values.length - 1)) * width
                const y = height - 2 - ((v - min) / range) * (height - 4)
                return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
              })
              .join(" ")}
            fill="none"
            stroke="var(--color-chart-1)"
            strokeOpacity={0.75}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx={(width / (values.length - 1)) * (values.length - 1)}
            cy={height - 2 - ((values[values.length - 1] - min) / range) * (height - 4)}
            r={2.5}
            fill={dotColour}
          />
        </svg>
      </motion.div>

      {/* Expanded view — positioned absolutely, anchored to bottom-right */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: duration.default, ease: easing.product }}
            className="absolute right-0 bottom-0 z-10 pointer-events-none"
            style={{ width: expandedWidth, height: expandedHeight }}
          >
            <div
              className="bg-surface border border-border-subtle rounded-md p-1.5 shadow-sm"
              style={{ width: expandedWidth, height: expandedHeight }}
            >
              <svg
                width={expandedWidth - 12}
                height={expandedHeight - 12}
                viewBox={`0 0 ${expandedWidth - 12} ${expandedHeight - 12}`}
                className="overflow-visible"
                aria-hidden
              >
                <path
                  d={areaPath
                    .replace(
                      /L([0-9.]+),([0-9.]+) L([0-9.]+),([0-9.]+) Z$/,
                      `L${(expandedWidth - 12 - padX).toFixed(1)},${(expandedHeight - 12 - padY).toFixed(1)} L${padX.toFixed(1)},${(expandedHeight - 12 - padY).toFixed(1)} Z`
                    )}
                  fill="var(--color-chart-1)"
                  fillOpacity={0.08}
                />
                <path
                  d={values
                    .map((v, i) => {
                      const innerW = expandedWidth - 12
                      const innerH = expandedHeight - 12
                      const x = padX + (i / (values.length - 1)) * (innerW - padX * 2)
                      const y =
                        innerH - padY - ((v - min) / range) * (innerH - padY * 2)
                      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
                    })
                    .join(" ")}
                  fill="none"
                  stroke="var(--color-chart-1)"
                  strokeOpacity={0.85}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx={
                    padX +
                    ((values.length - 1) / (values.length - 1)) *
                      (expandedWidth - 12 - padX * 2)
                  }
                  cy={
                    expandedHeight -
                    12 -
                    padY -
                    ((values[values.length - 1] - min) / range) *
                      (expandedHeight - 12 - padY * 2)
                  }
                  r={2.5}
                  fill={dotColour}
                />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}