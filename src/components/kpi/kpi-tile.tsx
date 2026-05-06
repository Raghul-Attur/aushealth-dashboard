"use client"

import { Info } from "lucide-react"
import { motion } from "framer-motion"
import { Delta } from "./delta"
import { Sparkline } from "./sparkline"
import { useCountUp } from "@/hooks/use-count-up"
import { fmt } from "@/lib/format"
import { revealVariants, revealTransition } from "@/lib/motion"

type Props = {
  /** Stable id for animation tracking */
  id: string
  label: string
  /** The raw numeric value being animated */
  rawValue: number
  /** How to format the displayed value */
  format: "currency" | "percent" | "number"
  delta?: { value: number; unit?: "percent" | "pp"; inverse?: boolean }
  sparklineValues?: number[]
  sparklineLabels?: string[]
  /** Editorial subtext — one-line interpretation under the value */
  subtext?: string
  /** Inverse semantic for the sparkline trailing dot */
  inverse?: boolean
  emphasis?: boolean
}

const formatters = {
    currency: fmt.currency,
    percent: fmt.percent,
    number: fmt.number,
    // Percentage points — used for net margin, loss ratio etc, displayed as "4.8%"
    pp: (n: number) => `${n.toFixed(1)}%`,
  }

export function KpiTile({
  id,
  label,
  rawValue,
  format,
  delta,
  sparklineValues,
  sparklineLabels,
  subtext,
  inverse = false,
  emphasis = false,
}: Props) {
  const animated = useCountUp({ id, to: rawValue, duration: 700 })
  const displayValue = formatters[format](animated)

  return (
    <motion.div
      variants={revealVariants}
      transition={revealTransition}
      className={`
        bg-surface border rounded-xl p-4
        ${emphasis ? "border-border-default" : "border-border-subtle"}
        flex flex-col justify-between min-h-[140px]
        transition-colors duration-fast
        hover:border-border-default
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-caption text-text-secondary">{label}</span>
        <button
          type="button"
          aria-label={`About ${label}`}
          className="text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <Info size={12} strokeWidth={1.75} />
        </button>
      </div>

      <div className={`tabular ${emphasis ? "text-kpi-hero" : "text-kpi-large"} leading-none mt-2`}>
        {displayValue}
      </div>

      {subtext && (
        <p className="text-caption text-text-tertiary mt-2 leading-snug">{subtext}</p>
      )}

      <div className="flex items-end justify-between gap-3 mt-3">
        {delta ? (
          <Delta value={delta.value} unit={delta.unit} inverse={delta.inverse} pill />
        ) : (
          <span />
        )}
        {sparklineValues && sparklineValues.length >= 2 && (
          <Sparkline values={sparklineValues} labels={sparklineLabels} inverse={inverse} static/>
        )}
      </div>
    </motion.div>
  )
}