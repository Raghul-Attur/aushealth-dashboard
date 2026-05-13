"use client"

import { PeriodOption } from "@/lib/period-utils"
import { useQueryState, parseAsStringEnum } from "nuqs"

const options: { key: PeriodOption; label: string; sublabel: string }[] = [
  { key: "4",   label: "4Q",  sublabel: "1 year"  },
  { key: "8",   label: "8Q",  sublabel: "2 years" },
  { key: "all", label: "All", sublabel: "Full"    },
]

export function PeriodSelector() {
    const [period, setPeriod] = useQueryState(
        "n",
        parseAsStringEnum<PeriodOption>(["4", "8", "all"])
          .withDefault("8")
          .withOptions({ shallow: false })
      )

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full p-1"
      style={{
        background: "rgba(255,255,255,0.84)",
        border: "1px solid rgba(0,47,108,0.10)",
        boxShadow: "0 4px 14px -6px rgba(0,47,108,0.18)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Live dot + label */}
      <div
        className="flex items-center gap-1.5 pl-2 pr-1 font-sans text-[11px] font-semibold"
        style={{ color: "var(--color-bupa-ink)" }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{
            background: "var(--color-bupa-blue)",
            boxShadow: "0 0 0 3px rgba(0,121,200,0.18)",
          }}
        />
        Q2 FY2026
      </div>

      {/* Divider */}
      <div
        className="w-px h-4 mx-1 flex-shrink-0"
        style={{ background: "rgba(0,47,108,0.12)" }}
      />

      {/* Toggle pills */}
      {options.map(({ key, label, sublabel }) => {
        const active = period === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => setPeriod(key)}
            title={sublabel}
            className="flex items-center font-sans text-[12px] font-semibold transition-all rounded-full"
            style={{
              padding: "4px 10px",
              background: active ? "var(--color-bupa-navy)" : "transparent",
              color: active ? "#fff" : "var(--color-text-tertiary)",
              boxShadow: active ? "0 2px 8px -2px rgba(0,47,108,0.4)" : "none",
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}