import { Icon, type IconName } from "@/components/icons/icon-defs"
import type { WatchItem } from "@/lib/insights"
import { cn } from "@/lib/utils"

type ToneStyles = {
  iconWrap: string
  pill: string
  icon: IconName
  label: string
}

const tone: Record<WatchItem["severity"], ToneStyles> = {
  action: {
    iconWrap: "bg-negative-bg text-negative",
    pill: "bg-negative-bg text-negative",
    icon: "alert",
    label: "Action",
  },
  watch: {
    iconWrap: "bg-warning-bg text-warning",
    pill: "bg-warning-bg text-warning",
    icon: "trend-down",
    label: "Watch",
  },
}

export function WatchListCard({ item }: { item: WatchItem }) {
  const t = tone[item.severity]

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
        className={cn(
          "inline-flex h-9 w-9 items-center justify-center rounded-xl",
          t.iconWrap
        )}
        aria-hidden
      >
        <Icon name={t.icon} />
      </span>

      <div className="min-w-0">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.16em]",
            t.pill
          )}
        >
          {t.label}
        </span>
        <div className="mt-1.5 font-serif text-[18px] font-normal leading-[1.2] tracking-[-0.015em] text-bupa-navy">
          {item.title}
        </div>
        <div className="mt-1 font-serif text-[13px] font-light italic leading-[1.5] text-text-secondary">
          {item.detail}
        </div>
      </div>

      <span className="self-center text-text-tertiary group-hover:text-bupa-navy">
        <Icon name="arrow-right" />
      </span>
    </button>
  )
}
