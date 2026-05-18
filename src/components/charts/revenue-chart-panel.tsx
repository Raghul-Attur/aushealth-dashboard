"use client"

import { useQueryState, parseAsStringEnum, parseAsString } from "nuqs"
import { LayeredAreaChart, type ViewMode } from "@/components/charts/layered-area"
import { SectionHeader } from "@/components/layout/section-header"
import type { Period } from "@/lib/data/schemas"

const views: { key: ViewMode; label: string }[] = [
  { key: "quarterly", label: "Quarterly" },
  { key: "ttm",       label: "TTM"       },
  { key: "yoy",       label: "YoY"       },
]

export function RevenueChartPanel({ periods, latest }: { periods: Period[]; latest: Period }) {
  const [view, setView] = useQueryState(
    "view",
    parseAsStringEnum<ViewMode>(["quarterly", "ttm", "yoy"])
      .withDefault("quarterly")
      .withOptions({ shallow: false })
  )

  const [compare] = useQueryState("compare", parseAsString.withDefault(""))
  const showPriorYear = compare === "true"

  return (
    <div className="glass" style={{ overflow: "visible" }}>
      <SectionHeader
       
       
        title="Revenue and claims, by quarter."
       
        subtitle="Premium revenue and incurred claims across the last eight quarters. The space between is gross underwriting margin."
        right={
          <div className="flex items-center rounded-full p-0.5"
            style={{
              background: "rgba(0,47,108,0.06)",
              border: "1px solid rgba(0,47,108,0.08)",
            }}>
            {views.map(({ key, label }) => (
              <button key={key} type="button" onClick={() => setView(key)}
                className="px-3 py-1.5 rounded-full font-sans text-[12px] font-medium transition-all"
                style={{
                  background: view === key ? "var(--color-bupa-navy)" : "transparent",
                  color: view === key ? "#fff" : "var(--color-text-tertiary)",
                  boxShadow: view === key ? "0 2px 8px -2px rgba(0,47,108,0.4)" : "none",
                }}>
                {label}
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-4 flex flex-wrap items-center gap-4 font-sans text-[12px]"
        style={{ color: "var(--color-text-secondary)" }}>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "var(--color-bupa-navy)" }} />
          {view === "yoy" ? "Revenue YoY %" : "Revenue"}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "var(--color-bupa-blue)" }} />
          {view === "yoy" ? "Claims proxy YoY %" : "Incurred claims"}
        </span>
        {view !== "yoy" && (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm"
              style={{ background: "rgba(0,47,108,0.25)", border: "1px solid rgba(0,47,108,0.25)" }} />
            Underwriting margin
          </span>
        )}
        {showPriorYear && view !== "yoy" && (
          <span className="inline-flex items-center gap-2">
            <span className="inline-block h-3 w-2 rounded-sm" style={{ background: "rgba(0,47,108,0.35)", borderTop: "2px dashed var(--color-bupa-navy)" }} />
            Prior year (dashed)
          </span>
        )}
        {view === "ttm" && (
          <span className="font-sans text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: "var(--color-bupa-teal-light)", color: "var(--color-bupa-blue-deep)" }}>
            Trailing 12-month rolling sum
          </span>
        )}
        {view === "yoy" && (
          <span className="font-sans text-[11px] px-2 py-0.5 rounded-full"
            style={{ background: "var(--color-warning-bg)", color: "var(--color-warning)" }}>
            YoY % change · dashed = zero growth
          </span>
        )}
      </div>

      <div className="mt-4" style={{ overflow: "visible" }}>
        <LayeredAreaChart periods={periods} view={view} showPriorYear={showPriorYear} />
      </div>
    </div>
  )
}