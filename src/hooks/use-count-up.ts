"use client"

import { useEffect, useRef, useState } from "react"

const SESSION_KEY = "aushealth-animated-once"

function getAnimatedSet(): Record<string, boolean> {
  if (typeof window === "undefined") return {}
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}")
  } catch {
    return {}
  }
}

function markAnimated(id: string) {
  if (typeof window === "undefined") return
  try {
    const animated = getAnimatedSet()
    animated[id] = true
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(animated))
  } catch {
    // ignore
  }
}

type Options = {
  id: string
  to: number
  duration?: number
  easing?: (t: number) => number
}

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4)

/**
 * Animates a number from 0 to target on first load per session.
 * On subsequent navigations within the same session, returns the
 * target value immediately.
 *
 * Initial render always returns the target value (avoids hydration
 * mismatch). Animation kicks in after mount via useEffect.
 */
export function useCountUp({ id, to, duration: dur = 600, easing = easeOutQuart }: Options) {
  // Always render the final value first (matches SSR), then animate from 0 if needed
  const [current, setCurrent] = useState(to)
  const rafRef = useRef<number | null>(null)
  const hasRunRef = useRef(false)

  useEffect(() => {
    if (hasRunRef.current) return
    hasRunRef.current = true

    // If already animated this session, stay at final value
    const animated = getAnimatedSet()
    if (animated[id]) {
      setCurrent(to)
      return
    }

    // Respect prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setCurrent(to)
      markAnimated(id)
      return
    }

    // Reset to 0 and animate up
    setCurrent(0)

    // Wait one frame so React applies the 0 before we start animating
    requestAnimationFrame(() => {
      const startTime = performance.now()
      const animate = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / dur, 1)
        setCurrent(to * easing(progress))
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate)
        } else {
          setCurrent(to)
          markAnimated(id)
        }
      }
      rafRef.current = requestAnimationFrame(animate)
    })

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [id, to, dur, easing])

  return current
}