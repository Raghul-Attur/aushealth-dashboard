"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { duration, easing } from "@/lib/motion"
import type { Specialty } from "@/lib/data/schemas"
import { fmt } from "@/lib/format"

type Props = {
  specialties: Specialty[]
}

export function SpecialtyTreemap({ specialties }: Props) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  // Compute total for size calculation
  const total = specialties.reduce((s, sp) => s + sp.benefitsPaid, 0)

  // Colour by YoY change: green (negative/stable) through red (high growth)
  const colourFor = (yoy: number) => {
    if (yoy >= 0.1) return "var(--color-negative)"
    if (yoy >= 0.07) return "var(--color-warning)"
    if (yoy >= 0.04) return "var(--color-chart-1)"
    return "var(--color-positive)"
  }

  return (
    <div className="grid grid-cols-12 gap-1 h-[320px]">
      {specialties.map((spec, i) => {
        const sizeWeight = spec.benefitsPaid / total
        // Map specialties to col-span and row-span based on rank
        // Top 4 get bigger tiles
        let colSpan = 2
        let rowSpan = 1
        if (i === 0) {
          colSpan = 4
          rowSpan = 2
        } else if (i < 4) {
          colSpan = 3
          rowSpan = 1
        } else if (i < 8) {
          colSpan = 3
          rowSpan = 1
        } else {
          colSpan = 2
          rowSpan = 1
        }

        const isHovered = hoverIdx === i
        const colour = colourFor(spec.yoyChange)

        return (
          <motion.div
            key={spec.specialty}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: duration.default,
              delay: i * 0.025,
              ease: easing.product,
            }}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            className={`
              relative rounded-md p-3 cursor-pointer overflow-hidden
              flex flex-col justify-between
              col-span-${colSpan} row-span-${rowSpan}
              transition-colors duration-fast
            `}
            style={{
              gridColumn: `span ${colSpan}`,
              gridRow: `span ${rowSpan}`,
              background: colour,
              opacity: isHovered ? 1 : 0.85,
            }}
          >
            <div className="relative z-10">
              <div
                className={`
                  font-medium text-text-inverse leading-tight
                  ${i === 0 ? "text-h3" : "text-body-sm"}
                `}
              >
                {spec.specialty}
              </div>
            </div>
            <div className="relative z-10 flex items-baseline justify-between">
              <span
                className={`
                  text-text-inverse tabular font-medium
                  ${i === 0 ? "text-kpi-medium" : "text-body-sm"}
                `}
              >
                {fmt.currency(spec.benefitsPaid)}
              </span>
              <span className="text-text-inverse text-caption tabular opacity-80">
                {spec.yoyChange > 0 ? "+" : ""}
                {fmt.percent(spec.yoyChange)}
              </span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}