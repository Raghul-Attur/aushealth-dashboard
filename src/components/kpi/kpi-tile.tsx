"use client"

import { motion } from "framer-motion"
import { TrendingDown, TrendingUp, BarChart2, Activity, Zap, Info } from "lucide-react"
import { Delta } from "./delta"
import { Sparkline } from "./sparkline"
import { useCountUp } from "@/hooks/use-count-up"
import { fmt } from "@/lib/format"
import { revealVariants, revealTransition } from "@/lib/motion"

type Props = {
  id: string
  label: string
  sublabel?: string
  rawValue: number
  format: "currency" | "percent" | "number" | "pp"
  delta?: { value: number; unit?: "percent" | "pp"; inverse?: boolean }
  sparklineValues?: number[]
  sparklineLabels?: string[]
  footnote1?: string
  footnote2?: string
  subtext?: string
  inverse?: boolean
  emphasis?: boolean
}

const formatters = {
  currency: fmt.currency,
  percent: fmt.percent,
  number: fmt.number,
  pp: (n: number) => `${n.toFixed(1)}%`,
}

// Icons resolved internally by id — avoids passing functions across Server/Client boundary
const iconMap: Record<string, React.ReactNode> = {
  "net-margin":  <TrendingDown size={12} strokeWidth={1.75} />,
  "revenue":     <TrendingUp   size={12} strokeWidth={1.75} />,
  "net-profit":  <BarChart2    size={12} strokeWidth={1.75} />,
  "loss-ratio":  <Activity     size={12} strokeWidth={1.75} />,
  "investment":  <Zap          size={12} strokeWidth={1.75} />,
}

export function KpiTile({
  id,
  label,
  sublabel,
  rawValue,
  format,
  delta,
  sparklineValues,
  sparklineLabels,
  footnote1,
  footnote2,
  subtext,
  inverse = false,
  emphasis = false,
}: Props) {
  const animated = useCountUp({ id, to: rawValue, duration: 700 })
  const displayValue = formatters[format](animated)
  const icon = iconMap[id] ?? <Info size={12} strokeWidth={1.75} />

  if (emphasis) {
    return (
      <motion.div
        variants={revealVariants}
        transition={revealTransition}
        className="card-inverse flex flex-col min-h-[160px]"
      >
        {/* Label row */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div
              className="text-[10px] font-semibold uppercase tracking-[0.1em]"
              style={{ color: "rgb(255 255 255 / 0.5)" }}
            >
              {label}
            </div>
            {sublabel && (
              <div className="text-[10px] mt-0.5" style={{ color: "rgb(255 255 255 / 0.35)" }}>
                {sublabel}
              </div>
            )}
          </div>
          <div
            className="p-1.5 rounded-md flex-shrink-0"
            style={{ background: "rgb(255 255 255 / 0.08)", color: "rgb(255 255 255 / 0.5)" }}
          >
            {icon}
          </div>
        </div>

        {/* Value */}
        <div className="mt-3">
          <div
            className="tabular leading-none"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            {displayValue}
          </div>
          {delta && (
            <div className="mt-2">
              <Delta value={delta.value} unit={delta.unit} inverse={delta.inverse} pill dark />
            </div>
          )}
        </div>

        {/* Sparkline */}
        {sparklineValues && sparklineValues.length >= 2 && (
          <div className="mt-3">
            <Sparkline values={sparklineValues} labels={sparklineLabels} inverse={inverse} dark static />
          </div>
        )}

        {/* Subtext */}
        {subtext && (
          <p className="text-[11px] leading-snug mt-3" style={{ color: "rgb(255 255 255 / 0.45)" }}>
            {subtext}
          </p>
        )}

        {/* Footnotes */}
        {(footnote1 || footnote2) && (
          <div
            className="flex items-center gap-3 mt-2 text-[11px]"
            style={{ color: "rgb(255 255 255 / 0.35)" }}
          >
            {footnote1 && <span>{footnote1}</span>}
            {footnote2 && <span>{footnote2}</span>}
          </div>
        )}
      </motion.div>
    )
  }

  // Standard light tile
  return (
    <motion.div
      variants={revealVariants}
      transition={revealTransition}
      className="card flex flex-col min-h-[160px]"
    >
      {/* Label + icon */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            {label}
          </div>
          {sublabel && (
            <div className="text-[10px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
              {sublabel}
            </div>
          )}
        </div>
        <div
          className="p-1.5 rounded-md flex-shrink-0"
          style={{ background: "var(--color-subtle)", color: "var(--color-text-tertiary)" }}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <div
        className="tabular mt-3 leading-none"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(22px, 3vw, 32px)",
          fontWeight: 800,
          color: "var(--color-text-primary)",
        }}
      >
        {displayValue}
      </div>

      {/* Delta */}
      {delta && (
        <div className="mt-2">
          <Delta value={delta.value} unit={delta.unit} inverse={delta.inverse} pill />
        </div>
      )}

      {/* Sparkline */}
      {sparklineValues && sparklineValues.length >= 2 && (
        <div className="mt-3 flex-1 flex items-end">
          <Sparkline values={sparklineValues} labels={sparklineLabels} inverse={inverse} static />
        </div>
      )}

      {/* Subtext */}
      {subtext && (
        <p className="text-[11px] leading-snug mt-2" style={{ color: "var(--color-text-tertiary)" }}>
          {subtext}
        </p>
      )}

      {/* Footnotes */}
      {(footnote1 || footnote2) && (
        <div
          className="flex items-center gap-3 mt-2 text-[11px]"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {footnote1 && <span>{footnote1}</span>}
          {footnote2 && <span>{footnote2}</span>}
        </div>
      )}
    </motion.div>
  )
}