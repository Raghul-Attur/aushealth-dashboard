"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import { useInView } from "framer-motion"
import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
  className?: string
  /** Delay before the beat appears in view (seconds) */
  delay?: number
}

/**
 * A "story beat", a content section that fades in as it enters the viewport.
 * Used to give scroll-driven narrative pacing.
 */
export function Beat({ children, className, delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-15% 0px -15% 0px" })
  const reduce = useReducedMotion()

  return (
    <motion.section
      ref={ref}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.32, 0.72, 0, 1] }}
      className={cn("py-12 first:pt-4", className)}
    >
      {children}
    </motion.section>
  )
}

type NarrativeProps = {
  /** The editorial framing on the text side */
  eyebrow?: string
  claim: string
  body?: React.ReactNode
  /** The visual content (chart, KPI strip, etc) */
  visual: React.ReactNode
  /** Visual on left or right; alternate for rhythm */
  side?: "left" | "right"
  /** Make visual span the full width below the text instead of side-by-side */
  fullWidth?: boolean
  delay?: number
}

/**
 * A two-column narrative beat: editorial framing on one side, visual on the other.
 */
export function NarrativeBeat({
  eyebrow,
  claim,
  body,
  visual,
  side = "right",
  fullWidth = false,
  delay = 0,
}: NarrativeProps) {
  if (fullWidth) {
    return (
      <Beat delay={delay}>
        <div className="max-w-3xl mb-8">
          {eyebrow && (
            <div className="text-caption uppercase tracking-wider text-text-tertiary mb-3">
              {eyebrow}
            </div>
          )}
          <h2 className="text-h1 leading-tight mb-4">{claim}</h2>
          {body && (
            <div className="text-body text-text-secondary leading-relaxed space-y-3 max-w-2xl">
              {body}
            </div>
          )}
        </div>
        <div className="mt-4">{visual}</div>
      </Beat>
    )
  }

  return (
    <Beat delay={delay}>
      <div className="grid grid-cols-12 gap-8 items-start">
        <div
          className={cn(
            "col-span-12 lg:col-span-5",
            side === "right" ? "lg:order-1" : "lg:order-2"
          )}
        >
          {eyebrow && (
            <div className="text-caption uppercase tracking-wider text-text-tertiary mb-3">
              {eyebrow}
            </div>
          )}
          <h2 className="text-h1 leading-tight mb-4">{claim}</h2>
          {body && (
            <div className="text-body text-text-secondary leading-relaxed space-y-3">
              {body}
            </div>
          )}
        </div>
        <div
          className={cn(
            "col-span-12 lg:col-span-7",
            side === "right" ? "lg:order-2" : "lg:order-1"
          )}
        >
          {visual}
        </div>
      </div>
    </Beat>
  )
}