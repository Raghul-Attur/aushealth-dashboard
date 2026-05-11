"use client"

import { useId, useState } from "react"
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
  /** White-on-dark variant for use on glass-deep tiles. */
  onDark?: boolean
}

export function Sparkline({
  values,
  width = 80,
  height = 24,
  expandedWidth = 160,
  expandedHeight = 48,
  labels: _labels,
  static: isStatic = false,
  inverse = false,
  onDark = false,
}: Props) {
  void _labels // reserved for future tooltip wiring
  const [hovered, setHovered] = useState(false)
  const reactId = useId()
  const expanded = hovered && !isStatic

  if (values.length < 2) return null

  const w = expanded ? expandedWidth : width
  const h = expanded ? expandedHeight : height

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const padY = expanded ? 8 : 2

  const trendUp = values[values.length - 1] > values[0]
  const trendIsGood = inverse ? !trendUp : trendUp

  const lineStroke = onDark
    ? trendIsGood
      ? "#7be3a8"
      : "#ff9a8c"
    : "var(--color-bupa-navy)"
  const dotColour = onDark
    ? trendIsGood
      ? "#7be3a8"
      : "#ff9a8c"
    : trendIsGood
      ? "var(--color-positive)"
      : "var(--color-negative)"

  const areaGradId = `spark-area${reactId.replace(/:/g, "-")}`

  // Compact view
  const compactPath = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width
      const y = height - padY - ((v - min) / range) * (height - padY * 2)
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  const compactEndX = width
  const compactEndY =
    height - padY - ((values[values.length - 1] - min) / range) * (height - padY * 2)

  // Area path uses the same trajectory then closes to the baseline
  const compactArea =
    compactPath +
    ` L${compactEndX.toFixed(1)},${(height - padY).toFixed(1)} L0,${(height - padY).toFixed(1)} Z`

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex-shrink-0"
      style={{ width, height }}
    >
      <motion.div
        className="absolute left-0 top-0"
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
          <defs>
            <linearGradient id={areaGradId} x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                stopColor={onDark ? "#7be3a8" : "var(--color-bupa-navy)"}
                stopOpacity={onDark ? 0.55 : 0.18}
              />
              <stop
                offset="100%"
                stopColor={onDark ? "#7be3a8" : "var(--color-bupa-navy)"}
                stopOpacity="0"
              />
            </linearGradient>
          </defs>
          <path d={compactArea} fill={`url(#${areaGradId})`} />
          <path
            d={compactPath}
            fill="none"
            stroke={lineStroke}
            strokeOpacity={onDark ? 1 : 0.85}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={compactEndX} cy={compactEndY} r={3} fill={dotColour} />
        </svg>
      </motion.div>

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
              className="glass-strong rounded-md p-1.5"
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
                  d={values
                    .map((v, i) => {
                      const innerW = expandedWidth - 12
                      const innerH = expandedHeight - 12
                      const x = (i / (values.length - 1)) * innerW
                      const y =
                        innerH - padY - ((v - min) / range) * (innerH - padY * 2)
                      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
                    })
                    .join(" ")}
                  fill="none"
                  stroke={lineStroke}
                  strokeOpacity={0.85}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* w/h kept in scope to avoid unused-var noise from earlier expanded path */}
      <span hidden>{w}{h}</span>
    </div>
  )
}
