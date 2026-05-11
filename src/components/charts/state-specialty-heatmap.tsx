"use client"

import { motion } from "framer-motion"
import { duration, easing } from "@/lib/motion"
import type { HeatmapRow } from "@/lib/data/schemas"
import { fmt } from "@/lib/format"

type Props = {
  rows: HeatmapRow[]
  specialties: string[]
}

export function StateSpecialtyHeatmap({ rows, specialties }: Props) {
  let max = 0
  for (const row of rows) {
    for (const spec of specialties) {
      const v = row.specialties[spec] ?? 0
      if (v > max) max = v
    }
  }

  const intensity = (v: number) => {
    if (max === 0) return 0
    return Math.min(1, v / max)
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate" style={{ borderSpacing: "2px" }}>
        <thead>
          <tr>
            <th className="text-left text-caption text-text-secondary font-normal pb-3 pr-3 align-bottom">
              State
            </th>
            {specialties.map((spec) => (
              <th
                key={spec}
                className="text-caption text-text-secondary font-normal pb-3 px-1 align-bottom h-24"
              >
                <div className="flex justify-center h-full items-end">
                  <span
                    className="inline-block whitespace-nowrap origin-bottom-left"
                    style={{ transform: "rotate(-45deg) translateX(-2px)" }}
                  >
                    {spec}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.state}>
              <td className="text-body-sm font-medium pr-3 py-1">
                {row.state}
              </td>
              {specialties.map((spec, ci) => {
                const v = row.specialties[spec] ?? 0
                const i = intensity(v)
                return (
                  <motion.td
                    key={spec}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                      duration: duration.fast,
                      delay: 0.02 * (ri + ci),
                      ease: easing.product,
                    }}
                  >
                    <div
                      className="rounded text-caption tabular text-center px-2 py-1.5"
                      style={{
                        background: `color-mix(in srgb, var(--color-chart-1) ${i * 100}%, var(--color-subtle))`,
                        color: i > 0.5 ? "var(--color-text-inverse)" : "var(--color-text-primary)",
                      }}
                      title={`${row.state} · ${spec}: ${fmt.currency(v)}`}
                    >
                      {fmt.currency(v)}
                    </div>
                  </motion.td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}