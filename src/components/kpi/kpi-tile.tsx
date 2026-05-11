"use client"

import { motion } from "framer-motion"
import { Delta } from "./delta"
import { Sparkline } from "./sparkline"
import { Icon, type IconName } from "@/components/icons/icon-defs"
import { useCountUp } from "@/hooks/use-count-up"
import { fmt } from "@/lib/format"
import { revealVariants, revealTransition } from "@/lib/motion"
import { cn } from "@/lib/utils"

type Tint = "glass" | "cream" | "deep"

type Props = {
  id: string
  label: string
  rawValue: number
  format: "currency" | "percent" | "number" | "pp"
  delta?: { value: number; unit?: "percent" | "pp"; inverse?: boolean }
  sparklineValues?: number[]
  sparklineLabels?: string[]
  /** One-line interpretation under the value, set in italic Fraunces. */
  subtext?: string
  /** Optional small footnote pair, e.g. ["vs prior 5.74%", "TTM 5.48%"]. */
  footnote?: [string, string]
  /** Inverse semantic for the sparkline trailing dot. */
  inverse?: boolean
  /** Visual emphasis level: 'deep' for the hero KPI on Overview. */
  tint?: Tint
  /**
   * Legacy emphasis flag. Equivalent to `tint="deep"`. Kept so the existing
   * pages (Financial / Customer / Operational / story views) inherit the new
   * hero treatment for their primary tile without code changes.
   */
  emphasis?: boolean
  /** Icon shown next to the label (left). Optional. */
  labelIcon?: IconName
  /** Icon shown in the top-right corner. Optional. */
  cornerIcon?: IconName
}

/**
 * Resolve a sensible labelIcon from the tile id or label if one wasn't given.
 * Lets existing pages pick up icons without code changes.
 */
function resolveLabelIcon(
  id: string,
  label: string,
  override?: IconName
): IconName | undefined {
  if (override) return override
  const key = `${id} ${label}`.toLowerCase()
  if (key.includes("revenue")) return "coin"
  if (key.includes("profit")) return "bar-chart"
  if (key.includes("margin")) return "pct"
  if (key.includes("loss") || key.includes("claims")) return "stethoscope"
  if (key.includes("investment")) return "spark"
  if (key.includes("benefit")) return "coin"
  if (key.includes("service")) return "activity"
  if (key.includes("gap") || key.includes("out-of-pocket")) return "alert"
  if (key.includes("growth") || key.includes("fastest")) return "trend-up"
  if (key.includes("population") || key.includes("members") || key.includes("insured"))
    return "users"
  if (key.includes("coverage")) return "shield-plus"
  if (key.includes("state")) return "map-pin"
  return undefined
}

function resolveCornerIcon(
  delta: Props["delta"],
  override?: IconName
): IconName | undefined {
  if (override) return override
  if (!delta) return undefined
  if (Math.abs(delta.value) < 0.0005) return "arrow-right"
  return delta.value > 0 ? "trend-up" : "trend-down"
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
  footnote,
  inverse = false,
  tint,
  emphasis = false,
  labelIcon,
  cornerIcon,
}: Props) {
  const animated = useCountUp({ id, to: rawValue, duration: 700 })

  const formatters = {
    currency: fmt.currency,
    percent: fmt.percent,
    number: fmt.number,
    pp: (n: number) => `${n.toFixed(1)}%`,
  }
  const displayValue = formatters[format](animated)

  const resolvedLabelIcon = resolveLabelIcon(id, label, labelIcon)
  const resolvedCornerIcon = resolveCornerIcon(delta, cornerIcon)

  // Legacy `emphasis` boolean maps to the new deep tint when no explicit tint
  // is given. Explicit `tint` always wins.
  const effectiveTint: Tint = tint ?? (emphasis ? "deep" : "glass")
  const isDeep = effectiveTint === "deep"
  const containerClass =
    effectiveTint === "deep"
      ? "glass-deep"
      : effectiveTint === "cream"
        ? "glass-cream"
        : "glass"

  const labelColour = isDeep ? "text-white/65" : "text-text-tertiary"
  const valueColour = isDeep ? "text-white" : "text-bupa-navy"
  const subtextColour = isDeep ? "text-white/[0.78]" : "text-text-secondary"
  const footColour = isDeep ? "text-white/65" : "text-text-tertiary"

  const cornerWrapClass = isDeep
    ? "bg-white/[0.12] border-white/[0.18] text-white"
    : tint === "cream"
      ? "bg-bupa-gold/[0.18] border-bupa-gold/30 text-[#6e4f15]"
      : "bg-bupa-blue/[0.10] border-bupa-blue/[0.16] text-bupa-blue-deep"

  return (
    <motion.div
      variants={revealVariants}
      transition={revealTransition}
      className={cn(containerClass, "flex min-h-[200px] flex-col")}
    >
      {/* Head row: label + corner icon */}
      <div className="relative z-[1] mb-3 flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.14em]",
            labelColour
          )}
        >
          {resolvedLabelIcon && (
            <Icon
              name={resolvedLabelIcon}
              size="sm"
              style={isDeep ? { color: "#fff" } : undefined}
            />
          )}
          {label}
        </span>

        {resolvedCornerIcon && (
          <span
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-[10px] border",
              cornerWrapClass
            )}
          >
            <Icon name={resolvedCornerIcon} />
          </span>
        )}
      </div>

      {/* Value */}
      <div
        className={cn(
          "relative z-[1] flex items-baseline gap-1 font-serif font-light tracking-[-0.025em] tabular leading-none",
          valueColour,
          isDeep ? "text-[88px]" : "text-[48px]"
        )}
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 50' }}
      >
        {/* When values are like "$8.6B" or "4.84%", we display them whole.
            The animated count shows just the magnitude; the formatter handles unit suffix. */}
        <span>{displayValue}</span>
        {/* Subtle status delta indicator after value, only for non-deep tiles */}
      </div>

      {/* Delta pill */}
      {delta && (
        <div className="relative z-[1] mt-3">
          <Delta
            value={delta.value}
            unit={delta.unit}
            inverse={delta.inverse ?? inverse}
            onDark={isDeep}
          />
        </div>
      )}

      {/* Sparkline */}
      {sparklineValues && sparklineValues.length >= 2 && (
        <div className="relative z-[1] mt-4">
          <Sparkline
            values={sparklineValues}
            labels={sparklineLabels}
            width={isDeep ? 320 : 240}
            height={isDeep ? 56 : 38}
            inverse={inverse}
            onDark={isDeep}
            static
          />
        </div>
      )}

      {/* Subtext */}
      {subtext && (
        <p
          className={cn(
            "relative z-[1] mt-3 font-serif text-[13px] font-light italic leading-[1.5]",
            subtextColour
          )}
        >
          {subtext}
        </p>
      )}

      {/* Footnote pair */}
      {footnote && (
        <div
          className={cn(
            "relative z-[1] mt-auto flex items-end justify-between pt-4 font-sans text-[11px]",
            footColour
          )}
        >
          <span>{footnote[0]}</span>
          <span className="font-mono tracking-tight tabular">{footnote[1]}</span>
        </div>
      )}
    </motion.div>
  )
}
