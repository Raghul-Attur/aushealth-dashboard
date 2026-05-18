import { Icon, type IconName } from "@/components/icons/icon-defs"
import type { WatchItem } from "@/lib/insights"
import { cn } from "@/lib/utils"

type ToneStyles = {
  iconWrap: string
  pillBg: string
  pillText: string
  icon: IconName
  label: string
}

const toneMap: Record<string, ToneStyles> = {
  action: {
    iconWrap: "bg-negative-bg text-negative",
    pillBg: "var(--color-negative-bg)",
    pillText: "var(--color-negative)",
    icon: "alert",
    label: "Action",
  },
  watch: {
    iconWrap: "bg-warning-bg text-warning",
    pillBg: "var(--color-warning-bg)",
    pillText: "var(--color-warning)",
    icon: "trend-down",
    label: "Watch",
  },
  capital: {
    iconWrap: "text-bupa-blue-deep",
    pillBg: "rgba(0,121,200,0.12)",
    pillText: "var(--color-bupa-blue-deep)",
    icon: "vault",
    label: "Capital",
  },
}

export function WatchListCard({ item }: { item: WatchItem & { severity: string } }) {
  const t = toneMap[item.severity] ?? toneMap.watch

  return (
    <button
      type="button"
      className={cn(
        "glass-strong group w-full rounded-[20px] p-5 text-left transition-transform",
        "grid grid-cols-[36px_1fr_auto] items-start gap-3.5",
        "hover:-translate-y-[2px]"
      )}
    >
      <span
        className={cn("inline-flex h-9 w-9 items-center justify-center rounded-xl flex-shrink-0", t.iconWrap)}
        style={item.severity === ("capital" as string) ? { background: "rgba(0,121,200,0.14)" } : undefined}
        aria-hidden
      >
        <Icon name={t.icon} />
      </span>

      <div className="min-w-0">
        <span
          className="inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em]"
          style={{ background: t.pillBg, color: t.pillText }}
        >
          {t.label}
        </span>
        <div
          className="mt-1.5 font-sans font-bold text-[15px] font-normal leading-[1.2] tracking-[-0.015em]"
          style={{ color: "var(--color-bupa-navy)" }}
        >
          {item.title}
        </div>
        <div
          className="mt-1 font-serif text-[13px] font-light italic leading-[1.5]"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {item.detail}
        </div>
      </div>

      <span className="self-center" style={{ color: "var(--color-text-tertiary)" }}>
        <Icon name="arrow-right" />
      </span>
    </button>
  )
}