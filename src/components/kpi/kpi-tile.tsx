"use client"

import { motion } from "framer-motion"
import { Delta } from "./delta"
import { Sparkline } from "./sparkline"
import { Icon, type IconName } from "@/components/icons/icon-defs"
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
  footnote?: [string, string]
  subtext?: string
  inverse?: boolean
  tint?: "deep" | "cream"
  labelIcon?: IconName
  cornerIcon?: IconName
}

const formatters = {
  currency: fmt.currency,
  percent:  fmt.percent,
  number:   fmt.number,
  pp:       (n: number) => `${n.toFixed(2)}%`,
}

// Heavy grotesque — matches the reference screenshot
const numStyle = (size: "hero" | "standard"): React.CSSProperties => ({
  fontFamily: "var(--font-sans)",
  fontSize: size === "hero" ? "clamp(40px, 4.5vw, 68px)" : "clamp(24px, 2.8vw, 44px)",
  fontWeight: 800,
  lineHeight: 1,
  letterSpacing: "-0.03em",
  fontVariantNumeric: "tabular-nums",
})

export function KpiTile({
  id, label, sublabel, rawValue, format, delta,
  sparklineValues, sparklineLabels, footnote, subtext,
  inverse = false, tint, labelIcon, cornerIcon,
}: Props) {
  const animated = useCountUp({ id, to: rawValue, duration: 700 })
  const displayValue = formatters[format](animated)

  // Determine sparkline semantic colour
  const sparkColor = tint === "deep"
    ? undefined  // handled via dark prop
    : inverse
      ? undefined  // sparkline will use trend logic with inverse
      : undefined

  // ── Deep navy ───────────────────────────────────────────────────────────
  if (tint === "deep") {
    return (
      <motion.div variants={revealVariants} transition={revealTransition}
        className="glass-deep flex flex-col gap-3" style={{ padding: "28px", minHeight: "240px" }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {labelIcon && <Icon name={labelIcon} size="sm" style={{ color: "rgba(255,255,255,0.5)" }} />}
            <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "rgba(255,255,255,0.55)" }}>
              {label}{sublabel && <span className="ml-1 opacity-60">· {sublabel}</span>}
            </div>
          </div>
          {cornerIcon && (
            <div className="p-1.5 rounded-[10px] flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)" }}>
              <Icon name={cornerIcon} size="sm" />
            </div>
          )}
        </div>

        <div style={{ ...numStyle("hero"), color: "#ffffff" }}>{displayValue}</div>

        {delta && <Delta value={delta.value} unit={delta.unit} inverse={delta.inverse} pill dark />}

        {sparklineValues && sparklineValues.length >= 2 && (
          <div className="w-full">
            <Sparkline values={sparklineValues} labels={sparklineLabels} inverse={inverse} dark static width={200} height={36} />
          </div>
        )}

        {subtext && (
          <p className="font-sans text-[12px] leading-snug" style={{ color: "rgba(255,255,255,0.6)" }}>
            {subtext}
          </p>
        )}

        {footnote && (footnote[0] || footnote[1]) && (
          <div className="mt-auto flex items-center justify-between font-sans text-[11px]"
            style={{ color: "rgba(255,255,255,0.4)" }}>
            {footnote[0] && <span>{footnote[0]}</span>}
            {footnote[1] && <span>{footnote[1]}</span>}
          </div>
        )}
      </motion.div>
    )
  }

  // ── Cream ────────────────────────────────────────────────────────────────
  if (tint === "cream") {
    return (
      <motion.div variants={revealVariants} transition={revealTransition}
        className="glass-cream flex flex-col gap-3" style={{ minHeight: "220px" }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {labelIcon && <Icon name={labelIcon} size="sm" style={{ color: "var(--color-warning)" }} />}
            <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: "var(--color-text-tertiary)" }}>{label}</div>
          </div>
          {cornerIcon && (
            <div className="p-1.5 rounded-[10px] flex-shrink-0"
              style={{ background: "rgba(193,154,75,0.18)", border: "1px solid rgba(193,154,75,0.25)", color: "#6e4f15" }}>
              <Icon name={cornerIcon} size="sm" />
            </div>
          )}
        </div>

        <div style={{ ...numStyle("standard"), color: "var(--color-bupa-navy)" }}>{displayValue}</div>

        {delta && <Delta value={delta.value} unit={delta.unit} inverse={delta.inverse} pill />}

        {sparklineValues && sparklineValues.length >= 2 && (
          <div className="w-full">
            <Sparkline values={sparklineValues} labels={sparklineLabels} inverse={inverse} static width={200} height={36} />
          </div>
        )}

        {subtext && (
          <p className="font-sans text-[12px] leading-snug" style={{ color: "var(--color-text-secondary)" }}>
            {subtext}
          </p>
        )}

        {footnote && (footnote[0] || footnote[1]) && (
          <div className="mt-auto flex items-center justify-between font-sans text-[11px]"
            style={{ color: "var(--color-text-tertiary)" }}>
            {footnote[0] && <span>{footnote[0]}</span>}
            {footnote[1] && <span>{footnote[1]}</span>}
          </div>
        )}
      </motion.div>
    )
  }

  // ── Standard glass ───────────────────────────────────────────────────────
  return (
    <motion.div variants={revealVariants} transition={revealTransition}
      className="glass flex flex-col gap-3" style={{ minHeight: "220px" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {labelIcon && <Icon name={labelIcon} size="sm" style={{ color: "var(--color-text-tertiary)" }} />}
          <div className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ color: "var(--color-text-tertiary)" }}>{label}</div>
        </div>
        {cornerIcon && (
          <div className="p-1.5 rounded-[10px] flex-shrink-0"
            style={{ background: "rgba(0,121,200,0.09)", border: "1px solid rgba(0,121,200,0.14)", color: "var(--color-bupa-blue-deep)" }}>
            <Icon name={cornerIcon} size="sm" />
          </div>
        )}
      </div>

      <div style={{ ...numStyle("standard"), color: "var(--color-bupa-navy)" }}>{displayValue}</div>

      {delta && <Delta value={delta.value} unit={delta.unit} inverse={delta.inverse} pill />}

      {sparklineValues && sparklineValues.length >= 2 && (
        <div className="w-full">
          <Sparkline values={sparklineValues} labels={sparklineLabels} inverse={inverse} static width={200} height={36} />
        </div>
      )}

      {subtext && (
        <p className="font-sans text-[12px] leading-snug" style={{ color: "var(--color-text-secondary)" }}>
          {subtext}
        </p>
      )}

      {footnote && (footnote[0] || footnote[1]) && (
        <div className="mt-auto flex items-center justify-between font-sans text-[11px]"
          style={{ color: "var(--color-text-tertiary)" }}>
          {footnote[0] && <span>{footnote[0]}</span>}
          {footnote[1] && <span>{footnote[1]}</span>}
        </div>
      )}
    </motion.div>
  )
}