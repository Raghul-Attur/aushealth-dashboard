"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Icon } from "@/components/icons/icon-defs"
import type { Headline } from "@/lib/insights"
import { duration, easing } from "@/lib/motion"

const statusTone: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  healthy: { dot: "#00857C", bg: "rgba(0,133,124,0.12)", text: "#005C56", label: "Healthy" },
  watch:   { dot: "#B07A0A", bg: "rgba(176,122,10,0.12)", text: "#7A5407", label: "Watch"   },
  action:  { dot: "#C0392B", bg: "rgba(192,57,43,0.12)",  text: "#8B2820", label: "Action"  },
}

const part2Colour: Record<string, string> = {
  healthy: "var(--color-bupa-blue)",
  watch:   "#B07A0A",
  action:  "#C0392B",
}

const avatars = [
  { initials: "EM", bg: "linear-gradient(135deg, #0079C8, #002F6C)" },
  { initials: "JT", bg: "linear-gradient(135deg, #C19A4B, #8a6826)" },
  { initials: "PK", bg: "linear-gradient(135deg, #00A9CE, #005EA8)" },
  { initials: "+4", bg: "linear-gradient(135deg, #6B3FA0, #3a1f60)" },
]

export function KpiHero({ headline }: { headline: Headline }) {
  const tone = statusTone[headline.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.reveal, ease: easing.product }}
      className="glass"
    >
      <div className="grid items-start gap-8 lg:grid-cols-[1fr_280px]">
        {/* ── Left ── */}
        <div className="min-w-0">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.2em]"
            style={{ color: "var(--color-bupa-blue-deep)" }}>
            <Icon name="calendar" size="sm" style={{ color: "var(--color-bupa-blue)" }} />
            Group performance · Quarter ending Dec 2025
          </div>

          {/* Two-part dynamic headline */}
          <h1 className="mt-3 font-sans"
            style={{
              fontSize: "clamp(38px, 5.5vw, 76px)",
              fontWeight: 800,
              lineHeight: 0.96,
              letterSpacing: "-0.03em",
              color: "var(--color-bupa-navy)",
            }}>
            {headline.part1}{" "}
            <span style={{ color: "var(--color-bupa-blue)" }}>&amp;</span>
            <br />
            <span style={{ color: part2Colour[headline.part2Status] }}>
              {headline.part2}.
            </span>
          </h1>

          {/* Lede */}
          <p className="mt-4 max-w-[500px] font-sans leading-[1.65]"
            style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
            {headline.sentence}
          </p>

          {/* ── Signal strip ── */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {headline.signals.map((sig, i) => {
              const isGood = sig.inverse
                ? sig.trend === "down"
                : sig.trend === "up"
              const isBad = sig.inverse
                ? sig.trend === "up"
                : sig.trend === "down"
              const trendColour = isGood
                ? "var(--color-positive)"
                : isBad
                ? "var(--color-negative)"
                : "var(--color-text-tertiary)"

              const TrendIcon = sig.trend === "up"
                ? TrendingUp
                : sig.trend === "down"
                ? TrendingDown
                : Minus

              return (
                <div key={i}
                  className="inline-flex items-center gap-2 font-sans"
                  style={{
                    background: "rgba(0,47,108,0.05)",
                    border: "1px solid rgba(0,47,108,0.08)",
                    borderRadius: "999px",
                    padding: "6px 14px",
                  }}>
                  <span className="text-[11px] font-medium uppercase tracking-[0.1em]"
                    style={{ color: "var(--color-text-tertiary)" }}>
                    {sig.label}
                  </span>
                  <span className="text-[13px] font-bold tabular"
                    style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
                    {sig.value}
                  </span>
                  {sig.delta && (
                    <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold"
                      style={{ color: trendColour }}>
                      <TrendIcon size={11} strokeWidth={2.5} />
                      {sig.delta}
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* CTAs */}
          <div className="mt-6 flex items-center gap-3">
            <button type="button"
              className="inline-flex items-center gap-2.5 font-sans text-[13px] font-semibold text-white"
              style={{
                background: "var(--color-bupa-navy)",
                padding: "0 22px", height: "44px", borderRadius: "999px",
                boxShadow: "0 8px 24px -8px rgba(0,47,108,0.5), inset 0 1px 0 rgba(255,255,255,0.18)",
              }}>
              Open quarterly briefing
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full"
                style={{ background: "var(--color-bupa-blue)" }}>
                <Icon name="arrow-right" size="sm" style={{ color: "#fff" }} />
              </span>
            </button>
            <button type="button"
              className="inline-flex items-center gap-2 font-sans text-[13px] font-medium"
              style={{
                background: "rgba(255,255,255,0.84)", color: "var(--color-bupa-navy)",
                padding: "0 18px", height: "44px", borderRadius: "999px",
                border: "1px solid rgba(0,47,108,0.12)",
                boxShadow: "0 4px 14px -6px rgba(0,47,108,0.18)",
              }}>
              <Icon name="eye-open" size="sm" />
              Compare vs prior year
            </button>
          </div>
        </div>

        {/* ── Right: stakeholders + status ── */}
        <div className="flex flex-col items-end gap-4 pt-2 flex-shrink-0" style={{ minWidth: "280px" }}>
          {/* Reviewer pill */}
          <div className="inline-flex items-center gap-3"
            style={{
              background: "rgba(255,255,255,0.84)",
              border: "1px solid rgba(0,47,108,0.08)",
              borderRadius: "999px", padding: "6px 16px 6px 6px",
              boxShadow: "0 6px 20px -8px rgba(0,47,108,0.2)",
              minWidth: "280px"
            }}>
            <div className="flex">
              {avatars.map((av, i) => (
                <div key={av.initials}
                  className="inline-flex h-[28px] w-[28px] items-center justify-center rounded-full font-sans text-[10px] font-bold text-white"
                  style={{
                    background: av.bg,
                    border: "2px solid rgba(255,255,255,0.95)",
                    marginRight: i < avatars.length - 1 ? "-8px" : "0",
                  }}>
                  {av.initials}
                </div>
              ))}
            </div>
            <div className="ml-2 font-sans text-[12px] whitespace-nowrap" style={{ color: "var(--color-text-primary)" }}>
              <strong style={{ fontWeight: 600 }}>Reviewed by Board</strong>
              <span style={{ color: "var(--color-text-tertiary)", marginLeft: "4px" }}>· May 6</span>
            </div>
          </div>

          {/* Status pill */}
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-sans text-[12px] font-semibold"
            style={{ background: tone.bg, color: tone.text }}>
            <span className="relative flex h-2 w-2">
              <motion.span aria-hidden
                className="absolute inline-flex h-full w-full rounded-full"
                style={{ background: tone.dot }}
                animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.8, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: tone.dot }} />
            </span>
            {headline.statusLabel}
          </div>

          {/* Live indicator */}
          <span className="live-dot">Live · APRA refreshed 10:29 AM</span>
        </div>
      </div>
    </motion.div>
  )
}