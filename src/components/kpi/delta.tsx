import { fmt } from "@/lib/format"
import { cn } from "@/lib/utils"

type Props = {
  value: number
  unit?: "percent" | "pp"
  inverse?: boolean
  className?: string
  /** Pill style applies a coloured background */
  pill?: boolean
}

export function Delta({ value, unit = "percent", inverse = false, className, pill = false }: Props) {
  const isPositive = value > 0
  const isGood = inverse ? !isPositive : isPositive
  const isFlat = Math.abs(value) < 0.0005

  const colour = isFlat
    ? "text-text-tertiary"
    : isGood
    ? "text-positive"
    : "text-negative"

  const bgColour = isFlat
    ? "bg-subtle"
    : isGood
    ? "bg-positive-bg"
    : "bg-negative-bg"

  const arrow = isFlat ? "—" : value > 0 ? "▲" : "▼"
  const formatted =
    unit === "pp" ? fmt.pp(Math.abs(value)) : fmt.percent(Math.abs(value))

  if (pill) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-caption tabular font-medium",
          colour,
          bgColour,
          className
        )}
      >
        <span aria-hidden className="text-[9px] leading-none">{arrow}</span>
        <span>{formatted}</span>
      </span>
    )
  }

  return (
    <span className={cn("text-delta tabular inline-flex items-center gap-1", colour, className)}>
      <span aria-hidden>{arrow}</span>
      <span>{formatted}</span>
    </span>
  )
}