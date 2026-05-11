"use client"

import { motion } from "framer-motion"
import type { Headline } from "@/lib/insights"
import { Icon } from "@/components/icons/icon-defs"
import { duration, easing } from "@/lib/motion"

const statusTone: Record<
  Headline["status"],
  { dot: string; text: string; label: string }
> = {
  healthy: {
    dot: "bg-positive",
    text: "text-positive",
    label: "Healthy",
  },
  watch: {
    dot: "bg-warning",
    text: "text-warning",
    label: "Watch",
  },
  action: {
    dot: "bg-negative",
    text: "text-negative",
    label: "Action",
  },
}

export function KpiHero({ headline }: { headline: Headline }) {
  const tone = statusTone[headline.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.reveal, ease: easing.product }}
      className="glass"
    >
      <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2.5 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-bupa-blue-deep">
            <Icon name="calendar" size="sm" className="text-bupa-blue" />
            {headline.period} · Industry aggregate · APRA
          </div>

          <p
            className="mt-4 max-w-[900px] font-serif text-[34px] font-light leading-[1.18] tracking-[-0.022em] text-bupa-navy"
            style={{ fontVariationSettings: '"opsz" 144, "SOFT" 30' }}
          >
            {headline.sentence}
          </p>
        </div>

        <div className="flex flex-col items-end gap-3 lg:items-end">
          <span
            className={`inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 font-sans text-caption font-medium ${tone.text}`}
          >
            <span className="relative flex h-2 w-2">
              <motion.span
                aria-hidden
                className={`absolute inline-flex h-full w-full rounded-full ${tone.dot}`}
                animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.8, 1] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${tone.dot}`}
              />
            </span>
            {tone.label}
          </span>

          <span className="live-dot">Live · APRA refresh</span>
        </div>
      </div>
    </motion.div>
  )
}
