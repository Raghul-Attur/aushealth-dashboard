"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Sparkles, TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react"

type BentoMetric = {
  id: string
  label: string
  value: string
  delta?: string
  trend?: "up" | "down" | "flat"
  inverse?: boolean
  subtext?: string
  size: "hero" | "standard" | "small"
  category: "financial" | "customer" | "operational"
}

type SearchResult = {
  query: string
  summary: string
  metrics: BentoMetric[]
  insight: string
  recommended_actions: string[]
}

const SUGGESTED = [
  "Claims performance last quarter",
  "Net margin trend over 8 quarters",
  "Hospital coverage by state",
  "Investment result vs prior year",
  "Loss ratio breakdown",
  "Member growth trajectory",
]

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery("")
      setResult(null)
      setError(null)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  async function handleSearch(q: string) {
    if (!q.trim()) return
    setQuery(q)
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      })
      if (!res.ok) throw new Error("Search failed")
      const data = await res.json()
      setResult(data)
    } catch {
      setError("Search failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const categoryColor: Record<string, string> = {
    financial: "var(--color-bupa-navy)",
    customer: "var(--color-bupa-teal)",
    operational: "var(--color-bupa-blue)",
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 50,
              background: "rgba(0,47,108,0.15)",
              backdropFilter: "blur(2px)",
            }}
          />

          {/* Full-screen panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: "56px", left: 0, right: 0, bottom: 0,
              zIndex: 51,
              overflowY: "auto",
              background: "rgba(238,243,248,0.98)",
              backdropFilter: "blur(24px)",
              borderTop: "1px solid rgba(0,47,108,0.08)",
            }}
          >
            {/* Inner centred container */}
            <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 24px 40px" }}>

              {/* Search input */}
              <div style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "16px 0",
                borderBottom: "1px solid rgba(0,47,108,0.08)",
                marginBottom: "20px",
              }}>
                <Search size={18} strokeWidth={1.75} style={{ color: "var(--color-bupa-blue)", flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSearch(query) }}
                  placeholder="Ask anything — claims, margins, coverage, trends..."
                  style={{
                    flex: 1, fontFamily: "var(--font-sans)", fontSize: "15px",
                    fontWeight: 500, color: "var(--color-text-primary)",
                    background: "transparent", border: "none", outline: "none",
                    letterSpacing: "-0.01em",
                  }}
                />
                {query && (
                  <button onClick={() => { setQuery(""); setResult(null) }}
                    style={{ color: "var(--color-text-tertiary)", display: "flex", cursor: "pointer", background: "none", border: "none" }}>
                    <X size={15} />
                  </button>
                )}
                <button onClick={onClose}
                  style={{
                    fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600,
                    color: "var(--color-text-tertiary)", background: "var(--color-subtle)",
                    border: "none", borderRadius: "6px", padding: "4px 8px", cursor: "pointer",
                  }}>
                  ESC
                </button>
              </div>

              {/* Loading */}
              {loading && (
                <div style={{ padding: "60px 0", textAlign: "center" }}>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ display: "inline-block", marginBottom: "12px" }}>
                    <Sparkles size={28} style={{ color: "var(--color-bupa-blue)" }} />
                  </motion.div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--color-text-tertiary)" }}>
                    Analysing dashboard data…
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ padding: "24px 0", fontFamily: "var(--font-sans)", fontSize: "13px", color: "var(--color-negative)" }}>
                  {error}
                </div>
              )}

              {/* Results */}
              {result && !loading && (
                <div>
                  {/* Summary */}
                  <div style={{
                    background: "rgba(0,47,108,0.04)", borderRadius: "12px",
                    padding: "14px 16px", marginBottom: "20px",
                    display: "flex", alignItems: "flex-start", gap: "10px",
                  }}>
                    <Sparkles size={14} style={{ color: "var(--color-bupa-blue)", flexShrink: 0, marginTop: "2px" }} />
                    <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", lineHeight: 1.65, color: "var(--color-text-secondary)", margin: 0 }}>
                      {result.summary}
                    </p>
                  </div>

                  {/* Bento grid */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                    marginBottom: "20px",
                  }}>
                    {result.metrics.map((metric, i) => {
                      const isGood = metric.inverse ? metric.trend === "down" : metric.trend === "up"
                      const isBad  = metric.inverse ? metric.trend === "up"  : metric.trend === "down"
                      const trendColor = isGood ? "var(--color-positive)" : isBad ? "var(--color-negative)" : "var(--color-text-tertiary)"
                      const TrendIcon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Minus
                      const isHero = metric.size === "hero"

                      return (
                        <motion.div key={metric.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          style={{
                            gridColumn: isHero ? "span 2" : "span 1",
                            background: isHero ? "var(--color-bupa-navy)" : "white",
                            border: isHero ? "none" : "1px solid rgba(0,47,108,0.08)",
                            borderRadius: "16px",
                            padding: isHero ? "24px" : "18px 20px",
                            boxShadow: isHero
                              ? "0 20px 40px -12px rgba(0,47,108,0.35)"
                              : "0 4px 16px -4px rgba(0,47,108,0.08)",
                          }}>
                          <div style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 600,
                            textTransform: "uppercase", letterSpacing: "0.12em",
                            color: isHero ? "rgba(255,255,255,0.55)" : "var(--color-text-tertiary)",
                            marginBottom: "10px",
                          }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: categoryColor[metric.category], flexShrink: 0 }} />
                            {metric.label}
                          </div>

                          <div style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: isHero ? "clamp(32px, 3.5vw, 52px)" : "clamp(22px, 2.5vw, 36px)",
                            fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1,
                            marginBottom: "10px",
                            color: isHero ? "#fff" : "var(--color-bupa-navy)",
                          }}>
                            {metric.value}
                          </div>

                          {metric.delta && (
                            <div style={{
                              display: "inline-flex", alignItems: "center", gap: "4px",
                              fontFamily: "var(--font-sans)", fontSize: "11px", fontWeight: 600,
                              color: isHero ? (isGood ? "#4ade80" : isBad ? "#f87171" : "rgba(255,255,255,0.6)") : trendColor,
                              background: isHero ? "rgba(255,255,255,0.12)" : "rgba(0,47,108,0.05)",
                              borderRadius: "999px", padding: "3px 9px", marginBottom: "8px",
                            }}>
                              <TrendIcon size={10} strokeWidth={2.5} />
                              {metric.delta}
                            </div>
                          )}

                          {metric.subtext && (
                            <p style={{
                              fontFamily: "var(--font-sans)", fontSize: "12px", lineHeight: 1.5, margin: 0,
                              color: isHero ? "rgba(255,255,255,0.55)" : "var(--color-text-tertiary)",
                            }}>
                              {metric.subtext}
                            </p>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>

                  {/* Insight */}
                  {result.insight && (
                    <div style={{
                      background: "rgba(0,133,124,0.06)", border: "1px solid rgba(0,133,124,0.15)",
                      borderRadius: "12px", padding: "14px 18px", marginBottom: "16px",
                      fontFamily: "var(--font-sans)", fontSize: "13px", lineHeight: 1.6,
                      color: "var(--color-text-secondary)",
                    }}>
                      <strong style={{ color: "var(--color-positive)", display: "block", marginBottom: "4px", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em" }}>
                        Key insight
                      </strong>
                      {result.insight}
                    </div>
                  )}

                  {/* Recommended actions */}
                  {result.recommended_actions?.length > 0 && (
                    <div>
                      <div style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-text-tertiary)", marginBottom: "10px" }}>
                        Recommended actions
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {result.recommended_actions.map((action, i) => (
                          <div key={i} style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            fontFamily: "var(--font-sans)", fontSize: "13px",
                            color: "var(--color-text-secondary)",
                            background: "white", borderRadius: "10px", padding: "10px 14px",
                            border: "1px solid rgba(0,47,108,0.07)",
                          }}>
                            <ArrowRight size={13} style={{ color: "var(--color-bupa-blue)", flexShrink: 0 }} />
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Suggestions */}
              {!query && !result && !loading && (
                <div>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: "var(--color-text-tertiary)", marginBottom: "12px" }}>
                    Suggested queries
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {SUGGESTED.map((s) => (
                      <button key={s} onClick={() => handleSearch(s)}
                        style={{
                          fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 500,
                          color: "var(--color-bupa-navy)",
                          background: "white", border: "1px solid rgba(0,47,108,0.10)",
                          borderRadius: "999px", padding: "8px 16px",
                          cursor: "pointer",
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}