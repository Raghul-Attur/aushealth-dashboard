"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, BookOpen, CheckCircle, AlertTriangle } from "lucide-react"
import { easing, duration } from "@/lib/motion"

type Beat = {
  eyebrow: string
  claim: string
  body: string
  status?: "healthy" | "watch" | "action"
}

type Props = {
  open: boolean
  onClose: () => void
  period: string
  beats: Beat[]
}

const statusIcon = {
  healthy: <CheckCircle size={13} strokeWidth={2} style={{ color: "var(--color-positive)" }} />,
  watch:   <AlertTriangle size={13} strokeWidth={2} style={{ color: "var(--color-warning)" }} />,
  action:  <AlertTriangle size={13} strokeWidth={2} style={{ color: "var(--color-negative)" }} />,
}

const statusBg = {
  healthy: "rgba(0,133,124,0.07)",
  watch:   "rgba(176,122,10,0.07)",
  action:  "rgba(192,57,43,0.07)",
}

const statusBorder = {
  healthy: "rgba(0,133,124,0.15)",
  watch:   "rgba(176,122,10,0.18)",
  action:  "rgba(192,57,43,0.18)",
}

export function BriefingDrawer({ open, onClose, period, beats }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, onClose])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  // Reset scroll on open
  useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = 0
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — full screen, click closes */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 48,
              background: "rgba(0,47,108,0.25)",
              backdropFilter: "blur(3px)",
              WebkitBackdropFilter: "blur(3px)",
            }}
          />

          {/* Drawer panel — does NOT intercept backdrop clicks */}
          <motion.div
            key="drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.32, ease: easing.product }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: 60,
              right: 0,
              bottom: 0,
              zIndex: 49,
              width: "min(560px, 90vw)",
              display: "flex",
              flexDirection: "column",
              background: "var(--color-surface-raised)",
              borderLeft: "1px solid var(--color-border-subtle)",
              boxShadow: "-16px 0 48px -8px rgba(0,47,108,0.2)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Quarterly briefing"
          >
            {/* Header — fixed within drawer */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 24px",
              borderBottom: "1px solid var(--color-border-subtle)",
              flexShrink: 0,
              background: "var(--color-surface-raised)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "10px",
                  background: "var(--color-bupa-navy)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <BookOpen size={15} strokeWidth={1.75} style={{ color: "#fff" }} />
                </div>
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "14px", letterSpacing: "-0.02em", color: "var(--color-bupa-navy)" }}>
                    Quarterly briefing
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-text-tertiary)" }}>
                    {period} · Industry aggregate
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "var(--color-subtle)",
                  border: "none", cursor: "pointer",
                  color: "var(--color-text-tertiary)",
                  flexShrink: 0,
                }}
                aria-label="Close"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {beats.map((beat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration.slow, delay: i * 0.06, ease: easing.product }}
                  style={{
                    borderRadius: "14px",
                    padding: "16px 18px",
                    background: beat.status ? statusBg[beat.status] : "var(--color-subtle)",
                    border: `1px solid ${beat.status ? statusBorder[beat.status] : "var(--color-border-subtle)"}`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                    {beat.status && statusIcon[beat.status]}
                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)" }}>
                      {beat.eyebrow}
                    </span>
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "15px", fontWeight: 700, letterSpacing: "-0.02em", color: "var(--color-bupa-navy)", marginBottom: "6px", lineHeight: 1.3 }}>
                    {beat.claim}
                  </div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "13px", lineHeight: 1.65, color: "var(--color-text-secondary)" }}>
                    {beat.body}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div style={{
              padding: "12px 24px",
              borderTop: "1px solid var(--color-border-subtle)",
              flexShrink: 0,
              background: "var(--color-surface-raised)",
            }}>
              <div style={{ fontFamily: "var(--font-sans)", fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                Source: APRA Quarterly PHI Performance Statistics · Licensed CC BY 3.0 AU
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}