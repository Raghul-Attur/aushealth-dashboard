"use client"

import { motion } from "framer-motion"
import type { Segment } from "@/lib/data/schemas"
import { duration, easing } from "@/lib/motion"
import { fmt } from "@/lib/format"

type Props = {
  segments: Segment[]
}

export function SegmentBars({ segments }: Props) {
  const maxMembers = Math.max(...segments.map((s) => s.members))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {segments.map((seg, i) => {
        const widthPct = (seg.members / maxMembers) * 100

        return (
          <motion.div
            key={seg.segment}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: duration.default,
              delay: i * 0.06,
              ease: easing.product,
            }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-caption text-text-secondary">{seg.segment}</span>
              <span className="text-caption tabular text-text-tertiary">
                {fmt.percent(seg.retentionRate)} retained
              </span>
            </div>
            <div className="text-kpi-medium tabular">{fmt.number(seg.members)}</div>
            <div className="relative h-1 bg-subtle rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${widthPct}%` }}
                transition={{
                  duration: duration.chart,
                  delay: 0.2 + i * 0.06,
                  ease: easing.product,
                }}
                className="absolute inset-y-0 left-0 bg-chart-1"
                style={{ opacity: 0.6 }}
              />
            </div>
            <div className="flex items-center gap-2 text-caption tabular">
              <span className="text-positive">+{fmt.number(seg.netNew)}</span>
              <span className="text-text-tertiary">net new this quarter</span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}