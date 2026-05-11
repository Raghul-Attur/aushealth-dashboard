import { ArrowRight } from "lucide-react"
import type { WatchItem } from "@/lib/insights"

type ExtendedWatchItem = WatchItem & {
  severity: "watch" | "action" | "capital"
  metric?: string
}

const pillStyles: Record<string, { bg: string; text: string; label: string }> = {
  action: {
    bg: "var(--color-negative-bg)",
    text: "var(--color-negative-text)",
    label: "Action",
  },
  watch: {
    bg: "var(--color-warning-bg)",
    text: "var(--color-warning-text)",
    label: "Watch",
  },
  capital: {
    bg: "var(--color-accent-light)",
    text: "var(--color-accent)",
    label: "Capital",
  },
}

function WatchRow({ item }: { item: ExtendedWatchItem }) {
  const pill = pillStyles[item.severity] ?? pillStyles.watch

  return (
    <button
      type="button"
      className="w-full text-left px-4 py-3.5 group transition-colors hover:bg-subtle"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {/* Severity pill */}
          <div className="mb-1.5">
            <span
              className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-[0.08em]"
              style={{ background: pill.bg, color: pill.text }}
            >
              {pill.label}
            </span>
          </div>
          <div
            className="text-[13px] font-semibold leading-snug"
            style={{ color: "var(--color-text-primary)" }}
          >
            {item.title}
          </div>
          <div
            className="text-[12px] mt-1 leading-snug"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {item.detail}
          </div>
        </div>
        <ArrowRight
          size={14}
          strokeWidth={1.75}
          className="mt-1 flex-shrink-0 transition-transform group-hover:translate-x-0.5"
          style={{ color: "var(--color-text-tertiary)" }}
        />
      </div>
    </button>
  )
}

type Props = {
  items: ExtendedWatchItem[]
  title?: string
  onViewAll?: () => void
}

export function WatchList({ items, title = "Watch list", onViewAll }: Props) {
  return (
    <div
      className="card overflow-hidden p-0"
      style={{ borderColor: "var(--color-border-subtle)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--color-border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-[11px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {title}
          </span>
          <span
            className="text-[11px] px-1.5 py-0.5 rounded-full font-medium"
            style={{
              background: "var(--color-subtle)",
              color: "var(--color-text-secondary)",
            }}
          >
            {items.length} items
          </span>
        </div>
        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="text-[12px] flex items-center gap-1 transition-colors hover:text-text-primary"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            View all <ArrowRight size={12} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Rows */}
      <div className="divide-y" style={{ borderColor: "var(--color-border-subtle)" }}>
        {items.map((item, i) => (
          <WatchRow key={i} item={item} />
        ))}
      </div>
    </div>
  )
}

export type { ExtendedWatchItem }