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
      className={`
        flex items-center gap-2 h-8 px-2.5 rounded-full
        text-caption transition-colors duration-fast
        ${active
          ? "bg-white/10 text-text-inverse"
          : "text-text-inverse opacity-70 hover:opacity-100"}
      `}
    >
      <BookOpen size={14} strokeWidth={1.75} />
      <span>Story</span>
      <span
        role="switch"
        aria-checked={active}
        className={`
          relative inline-flex h-4 w-7 rounded-full transition-colors duration-fast
          ${active ? "bg-white/40" : "bg-white/15"}
        `}
      >
        <motion.span
          aria-hidden
          className="absolute top-0.5 inline-block h-3 w-3 rounded-full bg-white"
          animate={{ x: active ? 14 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </span>
    </button>
  )
}