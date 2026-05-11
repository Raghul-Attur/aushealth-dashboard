"use client"

import { motion } from "framer-motion"
import { useRef, useState } from "react"
import type { Headline } from "@/lib/insights"
import { duration, easing } from "@/lib/motion"

const statusColour: Record<Headline["status"], string> = {
  healthy: "bg-positive",
  watch: "bg-warning",
  action: "bg-negative",
}

/**
 * Splits the generated sentence into phrases for staggered reveal.
 * Splits on commas, "with", "but" — naturalistic cut points.
 */
function splitIntoPhrases(sentence: string): string[] {
  const parts = sentence.split(/(,\s*(?:with|but|driven by|despite|on)?\s*)/i)
  // Recombine separators with the following phrase
  const result: string[] = []
  let current = ""
  for (const part of parts) {
    if (part.match(/^,\s*/)) {
      if (current) result.push(current)
      current = part
    } else {
      current += part
    }
  }
  if (current) result.push(current)
  return result.filter((p) => p.trim().length > 0)
}

export function KpiHero({ headline }: { headline: Headline }) {
  const ref = useRef<HTMLDivElement>(null)
  const [glow, setGlow] = useState({ x: 50, y: 50, opacity: 0 })

  const phrases = splitIntoPhrases(headline.sentence)

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
      opacity: 1,
    })
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: duration.reveal, ease: easing.product }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setGlow((g) => ({ ...g, opacity: 0 }))}
      className="relative card-glass overflow-hidden"
    >
      {/* Ambient hover glow */}
      <motion.div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: glow.opacity }}
        transition={{ duration: duration.slow, ease: easing.product }}
        style={{
          background: `radial-gradient(circle 400px at ${glow.x}% ${glow.y}%, var(--color-chart-1) 0%, transparent 70%)`,
          mixBlendMode: "soft-light",
        }}
      />

      <div className="relative flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="text-caption text-text-secondary mb-2 flex items-center gap-2 flex-wrap">
            <span>{headline.period} results</span>
            <span className="text-text-tertiary">·</span>
            <span>Industry aggregate</span>
            <span className="text-text-tertiary">·</span>
            <span>APRA quarterly data</span>
          </div>
          <p className="text-display leading-tight max-w-[680px]">
            {phrases.map((phrase, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: duration.slow,
                  ease: easing.product,
                  delay: 0.3 + i * 0.18,
                }}
                style={{ display: "inline" }}
              >
                {phrase}
              </motion.span>
            ))}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <motion.span
              aria-hidden
              className={`absolute inline-flex h-full w-full rounded-full ${statusColour[headline.status]}`}
              animate={{ opacity: [0.4, 0, 0.4], scale: [1, 1.8, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusColour[headline.status]}`}
            />
          </span>
          <span className="text-body-sm text-text-secondary">{headline.statusLabel}</span>
        </div>
      </div>
    </motion.div>
  )
}