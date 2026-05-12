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

export function KpiTile({
  id,
  label,
  sublabel,
  rawValue,
  format,
  delta,
  sparklineValues,
  sparklineLabels,
  footnote,
  subtext,
  inverse = false,
  tint,
  labelIcon,
  cornerIcon,
}: Props) {
  const animated = useCountUp({ id, to: rawValue, duration: 700 })
  const displayValue = formatters[format](animated)

  if (tint === "deep") {
    return (
      <motion.div
        variants={revealVariants}
        transition={revealTransition}
        className="glass-deep flex flex-col min-h-[180px] gap-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {labelIcon && <Icon name={labelIcon} size="sm" style={{ color: "rgb(255 255 255 / 0.55)" }} />}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] font-sans" style={{ color: "rgb(255 255 255 / 0.55)" }}>
                {label}
              </div>
              {sublabel && <div className="text-[10px] mt-0.5 font-sans" style={{ color: "rgb(255 255 255 / 0.35)" }}>{sublabel}</div>}
            </div>
          </div>
          {cornerIcon && (
            <div className="p-1.5 rounded-xl flex-shrink-0" style={{ background: "rgb(255 255 255 / 0.1)", color: "rgb(255 255 255 / 0.55)" }}>
              <Icon name={cornerIcon} size="sm" />
            </div>
          )}
        </div>

        <div>
          <div
            className="tabular leading-none font-serif"
            style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 300, fontStyle: "italic", color: "#ffffff", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
          >
            {displayValue}
          </div>
          {delta && (
            <div className="mt-2">
              <Delta value={delta.value} unit={delta.unit} inverse={delta.inverse} pill dark />
            </div>
          )}
        </div>

        {sparklineValues && sparklineValues.length >= 2 && (
          <div className="mt-1">
            <Sparkline values={sparklineValues} labels={sparklineLabels} inverse={inverse} dark static />
          </div>
        )}

        {subtext && (
          <p className="font-serif text-[13px] font-light italic leading-snug" style={{ color: "rgb(255 255 255 / 0.5)" }}>
            {subtext}
          </p>
        )}

        {footnote && (footnote[0] || footnote[1]) && (
          <div className="mt-auto flex items-center gap-3 text-[11px] font-sans" style={{ color: "rgb(255 255 255 / 0.35)" }}>
            {footnote[0] && <span>{footnote[0]}</span>}
            {footnote[1] && <><span style={{ color: "rgb(255 255 255 / 0.18)" }}>·</span><span>{footnote[1]}</span></>}
          </div>
        )}
      </motion.div>
    )
  }

  if (tint === "cream") {
    return (
      <motion.div
        variants={revealVariants}
        transition={revealTransition}
        className="glass-cream flex flex-col min-h-[180px] gap-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {labelIcon && <Icon name={labelIcon} size="sm" className="text-bupa-blue-deep" />}
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary font-sans">{label}</div>
              {sublabel && <div className="text-[10px] mt-0.5 text-text-tertiary">{sublabel}</div>}
            </div>
          </div>
          {cornerIcon && (
            <div className="p-1.5 rounded-xl flex-shrink-0" style={{ background: "rgb(0 85 142 / 0.08)", color: "var(--color-bupa-blue-deep)" }}>
              <Icon name={cornerIcon} size="sm" />
            </div>
          )}
        </div>

        <div>
          <div
            className="tabular leading-none font-serif"
            style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 300, fontStyle: "italic", color: "var(--color-bupa-navy)", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
          >
            {displayValue}
          </div>
          {delta && (
            <div className="mt-2">
              <Delta value={delta.value} unit={delta.unit} inverse={delta.inverse} pill />
            </div>
          )}
        </div>

        {sparklineValues && sparklineValues.length >= 2 && (
          <div className="mt-1 flex-1 flex items-end">
            <Sparkline values={sparklineValues} labels={sparklineLabels} inverse={inverse} static />
          </div>
        )}

        {subtext && <p className="font-serif text-[13px] font-light italic leading-snug text-text-secondary">{subtext}</p>}

        {footnote && (footnote[0] || footnote[1]) && (
          <div className="mt-auto flex items-center gap-3 text-[11px] font-sans text-text-tertiary">
            {footnote[0] && <span>{footnote[0]}</span>}
            {footnote[1] && <><span>·</span><span>{footnote[1]}</span></>}
          </div>
        )}
      </motion.div>
    )
  }

  // Standard card
  return (
    <motion.div
      variants={revealVariants}
      transition={revealTransition}
      className="card flex flex-col min-h-[180px] gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {labelIcon && <Icon name={labelIcon} size="sm" className="text-text-tertiary" />}
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary font-sans">{label}</div>
            {sublabel && <div className="text-[10px] mt-0.5 text-text-tertiary">{sublabel}</div>}
          </div>
        </div>
        {cornerIcon && (
          <div className="p-1.5 rounded-xl flex-shrink-0" style={{ background: "var(--color-subtle)", color: "var(--color-text-tertiary)" }}>
            <Icon name={cornerIcon} size="sm" />
          </div>
        )}
      </div>

      <div>
        <div
          className="tabular leading-none font-serif"
          style={{ fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 300, fontStyle: "italic", color: "var(--color-bupa-navy)", fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
        >
          {displayValue}
        </div>
        {delta && (
          <div className="mt-2">
            <Delta value={delta.value} unit={delta.unit} inverse={delta.inverse} pill />
          </div>
        )}
      </div>

      {sparklineValues && sparklineValues.length >= 2 && (
        <div className="mt-1 flex-1 flex items-end">
          <Sparkline values={sparklineValues} labels={sparklineLabels} inverse={inverse} static />
        </div>
      )}

      {subtext && <p className="font-serif text-[13px] font-light italic leading-snug text-text-secondary">{subtext}</p>}

      {footnote && (footnote[0] || footnote[1]) && (
        <div className="mt-auto flex items-center gap-3 text-[11px] font-sans text-text-tertiary">
          {footnote[0] && <span>{footnote[0]}</span>}
          {footnote[1] && <><span>·</span><span>{footnote[1]}</span></>}
        </div>
      )}
    </motion.div>
  )
}