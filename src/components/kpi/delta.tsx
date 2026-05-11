import { Icon } from "@/components/icons/icon-defs"
import { fmt } from "@/lib/format"
import { cn } from "@/lib/utils"

type Props = {
  value: number
  unit?: "percent" | "pp"
  inverse?: boolean
  className?: string
  /** Pill style applies a coloured background. Default true on the new design. */
  pill?: boolean
  /** Use white-on-dark variants for placement on glass-deep cards. */
  onDark?: boolean
}

export function Delta({
  value,
  unit = "percent",
  inverse = false,
  className,
  pill = true,
  onDark = false,
}: Props) {
  const isPositive = value > 0
  const isGood = inverse ? !isPositive : isPositive
  const isFlat = Math.abs(value) < 0.0005

  const lightClasses = isFlat
    ? "bg-subtle text-text-tertiary"
    : isGood
      ? "bg-positive-bg text-positive"
      : "bg-negative-bg text-negative"

  const darkClasses = isFlat
    ? "bg-white/10 text-white/65"
    : isGood
      ? "bg-[rgba(94,210,142,0.18)] text-[#7be3a8]"
      : "bg-[rgba(255,140,128,0.18)] text-[#ff9a8c]"

  const colourClasses = onDark ? darkClasses : lightClasses

  const arrowName = isFlat ? "arrow-right" : value > 0 ? "arrow-up" : "arrow-down"
  const formatted =
    unit === "pp" ? fmt.pp(Math.abs(value)) : fmt.percent(Math.abs(value))

  if (pill) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 pl-2 font-sans text-caption font-semibold tabular",
          colourClasses,
          className
        )}
      >
        <Icon name={arrowName} size="sm" />
        <span>{formatted}</span>
      </span>
    )
  }

  const textColour = isFlat
    ? onDark
      ? "text-white/65"
      : "text-text-tertiary"
    : isGood
      ? "text-positive"
      : "text-negative"

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-sans text-delta tabular font-medium",
        textColour,
        className
      )}
    >
      <Icon name={arrowName} size="sm" />
      <span>{formatted}</span>
    </span>
  )
}
