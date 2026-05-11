"use client"

import { motion } from "framer-motion"
import { duration, easing } from "@/lib/motion"
import type { BulletData } from "@/lib/data/transforms"
import { fmt } from "@/lib/format"

type Props = {
  data: BulletData
}

export function BulletChart({ data }: Props) {
  const { label, actual, target, range, inverse } = data

  // Domain: 0 to slightly above range[2] OR actual, whichever is larger.
  // This ensures both actual and target are always visible.
  const domainMax = Math.max(range[2], actual, target) * 1.05
  const toPct = (v: number) => Math.min(100, (v / domainMax) * 100)

  // Status determination
  const onTarget = inverse ? actual <= target : actual >= target
  const inMidBand = inverse
    ? actual <= range[1] && actual > range[0]
    : actual >= range[1] && actual < range[2]

  const actualColour = onTarget
    ? "var(--color-positive)"
    : inMidBand
    ? "var(--color-warning)"
    : "var(--color-negative)"

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-caption text-text-secondary">{label}</span>
        <span className="text-caption tabular text-text-primary font-medium">
          {fmt.percent(actual)}
        </span>
      </div>

      <div
        className="relative h-3 rounded-sm overflow-hidden"
        role="img"
        aria-label={`${label}: actual ${fmt.percent(actual)}, target ${fmt.percent(target)}`}
      >
        {/* Quality bands — three layers (darkest to lightest, drawn back to front) */}
        <div
          className="absolute inset-y-0 left-0"
          style={{ width: `${toPct(range[2])}%`, background: "var(--color-subtle)" }}
        />
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${toPct(range[1])}%`,
            background: "var(--color-border-subtle)",
          }}
        />
        <div
          className="absolute inset-y-0 left-0"
          style={{
            width: `${toPct(range[0])}%`,
            background: "var(--color-border-default)",
          }}
        />

        {/* Actual bar — sits centered vertically */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${toPct(actual)}%` }}
          transition={{ duration: duration.chart, ease: easing.product }}
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-sm"
          style={{ background: actualColour }}
        />

        {/* Target marker — vertical line at target value */}
        <div
          className="absolute top-0 bottom-0 w-[2px]"
          style={{
            left: `${toPct(target)}%`,
            background: "var(--color-text-primary)",
          }}
        />
      </div>

      <div className="flex items-center justify-between text-micro text-text-tertiary tabular">
        <span>Target {fmt.percent(target)}</span>
        <span>{fmt.percent(domainMax)}</span>
      </div>
    </div>
  )
}