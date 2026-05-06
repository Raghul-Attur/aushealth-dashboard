import { ChevronRight } from "lucide-react"
import type { WatchItem } from "@/lib/insights"

export function WatchListCard({ item }: { item: WatchItem }) {
  const accent = item.severity === "action" ? "border-l-negative" : "border-l-warning"

  return (
    <button
      type="button"
      className={`
        w-full text-left bg-surface border border-border-subtle border-l-[3px] ${accent}
        rounded-r-md px-3 py-2.5 group
        hover:border-border-default transition-colors
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-body-sm font-medium leading-snug">{item.title}</div>
          <div className="text-caption text-text-secondary mt-0.5 leading-snug">
            {item.detail}
          </div>
        </div>
        <ChevronRight
          size={14}
          strokeWidth={1.75}
          className="text-text-tertiary mt-1 group-hover:text-text-secondary transition-colors flex-shrink-0"
        />
      </div>
    </button>
  )
}