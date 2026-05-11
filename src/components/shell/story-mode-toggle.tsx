"use client"

import { useStoryMode } from "@/stores/story-mode"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Icon } from "@/components/icons/icon-defs"
import { cn } from "@/lib/utils"

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
      className={cn(
        "glass-strong inline-flex h-9 items-center gap-2 rounded-full px-3 font-sans text-caption font-medium transition-colors",
        active
          ? "bg-bupa-navy text-white"
          : "text-bupa-navy hover:bg-bupa-navy/[0.04]"
      )}
      style={
        active
          ? { boxShadow: "0 8px 20px -8px rgba(10,31,68,0.5)" }
          : undefined
      }
    >
      <Icon name="book-open" size="sm" />
      <span>Story</span>
      <span
        role="switch"
        aria-checked={active}
        className={cn(
          "relative inline-flex h-4 w-7 rounded-full transition-colors",
          active ? "bg-white/40" : "bg-bupa-navy/10"
        )}
      >
        <motion.span
          aria-hidden
          className={cn(
            "absolute top-0.5 inline-block h-3 w-3 rounded-full",
            active ? "bg-white" : "bg-bupa-navy"
          )}
          animate={{ x: active ? 14 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </span>
    </button>
  )
}
