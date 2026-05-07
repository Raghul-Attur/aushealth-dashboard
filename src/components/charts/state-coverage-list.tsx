"use client"

import { motion } from "framer-motion"
import type { CoverageState } from "@/lib/data/schemas"
import { duration, easing } from "@/lib/motion"
import { fmt } from "@/lib/format"

type Props = {
  states: CoverageState[]
  metric?: "htCoverage" | "gtCoverage"
}

export function StateCoverageList({ states, metric = "htCoverage" }: Props) {
  const ranked = [...states].sort((a, b) => b[metric] - a[metric])
  const maxCoverage = Math.max(...ranked.map((s) => s[metric]))
  const minCoverage = Math.min(...ranked.map((s) => s[metric]))
  const range = maxCoverage - minCoverage

  return (
    <div className="flex flex-col gap-2">
      {ranked.map((state, i) => {
        const value = state[metric]
        const positionPct = range > 0 ? ((value - minCoverage) / range) * 100 : 50

        return (
          <motion.div
            key={state.state}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: duration.default,
              delay: i * 0.04,
              ease: easing.product,
            }}
            className="flex items-center gap-3"
          >
            <span className="text-caption tabular text-text-secondary w-8 flex-shrink-0">
              {state.state}
            </span>
            <div className="relative flex-1 h-1.5 bg-subtle rounded-full">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${positionPct}%` }}
                transition={{
                  duration: duration.chart,
                  delay: 0.15 + i * 0.04,
                  ease: easing.product,
                }}
                className="absolute inset-y-0 left-0 bg-chart-1 rounded-full"
                style={{ opacity: 0.45 }}
              />
              <motion.span
                initial={{ left: "0%" }}
                animate={{ left: `calc(${positionPct}% - 5px)` }}
                transition={{
                  duration: duration.chart,
                  delay: 0.15 + i * 0.04,
                  ease: easing.product,
                }}
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-chart-1"
              />
            </div>
            <span className="text-body-sm tabular font-medium w-12 text-right flex-shrink-0">
              {fmt.percent(value)}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}