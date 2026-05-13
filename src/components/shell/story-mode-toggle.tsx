"use client"

import { useStoryMode } from "@/stores/story-mode"
import { motion } from "framer-motion"
import { BookOpen } from "lucide-react"
import { useEffect, useState } from "react"

export function StoryModeToggle() {
  const { active, toggle } = useStoryMode()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={active}
      aria-label={active ? "Switch to explore mode" : "Switch to story mode"}
      className="flex items-center gap-2 h-[34px] px-3 rounded-full font-sans text-[12px] font-medium transition-all"
      style={{
        background: active ? "var(--color-bupa-navy)" : "rgba(255,255,255,0.84)",
        color: active ? "#fff" : "var(--color-bupa-navy)",
        border: "1px solid rgba(255,255,255,0.92)",
        boxShadow: active
          ? "0 8px 20px -8px rgba(10,31,68,0.5)"
          : "0 4px 14px -6px rgba(10,31,68,0.22)",
        backdropFilter: "blur(20px)",
      }}
    >
      <BookOpen size={14} strokeWidth={1.75} />
      <span>Story</span>
      <span
        className="relative inline-flex h-4 w-7 rounded-full transition-colors"
        style={{ background: active ? "rgba(255,255,255,0.35)" : "rgba(10,31,68,0.15)" }}
      >
        <motion.span
          aria-hidden
          className="absolute top-0.5 inline-block h-3 w-3 rounded-full"
          style={{ background: active ? "#fff" : "var(--color-bupa-blue)" }}
          animate={{ x: active ? 14 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </span>
    </button>
  )
}