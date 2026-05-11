"use client"

import { motion } from "framer-motion"
import { duration, easing } from "@/lib/motion"
import { fmt } from "@/lib/format"

type Props = {
  totalFees: number
  fundBenefits: number
  medicareBenefits: number
  patientOutOfPocket: number
}

export function GapFlow({ totalFees, fundBenefits, medicareBenefits, patientOutOfPocket }: Props) {
  const fundPct = (fundBenefits / totalFees) * 100
  const medicarePct = (medicareBenefits / totalFees) * 100
  const patientPct = (patientOutOfPocket / totalFees) * 100

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-caption text-text-secondary">Total fees charged</span>
          <span className="text-h3 tabular">{fmt.currency(totalFees)}</span>
        </div>
        <div className="relative h-3 bg-subtle rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: duration.chart, ease: easing.product }}
            className="absolute inset-y-0 left-0 bg-chart-1"
            style={{ opacity: 0.7 }}
          />
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-caption text-text-secondary">
            Insurance fund benefits
          </span>
          <span className="text-body-sm tabular">
            {fmt.currency(fundBenefits)}{" "}
            <span className="text-text-tertiary">({fundPct.toFixed(0)}%)</span>
          </span>
        </div>
        <div className="relative h-2 bg-subtle rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fundPct}%` }}
            transition={{
              duration: duration.chart,
              delay: 0.15,
              ease: easing.product,
            }}
            className="absolute inset-y-0 left-0 bg-chart-1"
            style={{ opacity: 0.85 }}
          />
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-caption text-text-secondary">Medicare benefits</span>
          <span className="text-body-sm tabular">
            {fmt.currency(medicareBenefits)}{" "}
            <span className="text-text-tertiary">({medicarePct.toFixed(0)}%)</span>
          </span>
        </div>
        <div className="relative h-2 bg-subtle rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${medicarePct}%` }}
            transition={{
              duration: duration.chart,
              delay: 0.3,
              ease: easing.product,
            }}
            className="absolute inset-y-0 left-0 bg-chart-2"
            style={{ opacity: 0.85 }}
          />
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="text-caption text-text-secondary">
            Patient out-of-pocket (the gap)
          </span>
          <span className="text-body-sm tabular">
            {fmt.currency(patientOutOfPocket)}{" "}
            <span className="text-text-tertiary">({patientPct.toFixed(0)}%)</span>
          </span>
        </div>
        <div className="relative h-2 bg-subtle rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${patientPct}%` }}
            transition={{
              duration: duration.chart,
              delay: 0.45,
              ease: easing.product,
            }}
            className="absolute inset-y-0 left-0 bg-warning"
            style={{ opacity: 0.85 }}
          />
        </div>
      </div>
    </div>
  )
}