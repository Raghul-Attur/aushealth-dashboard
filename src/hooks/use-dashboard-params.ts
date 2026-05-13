"use client"

import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs"

export type ViewMode = "quarterly" | "ttm" | "yoy"

/**
 * Syncs key dashboard state to URL query params.
 * Any URL produced is fully shareable — opening it restores exact state.
 *
 * Params:
 *   ?q=Q2+FY2026   — active quarter label
 *   ?view=quarterly|ttm|yoy  — chart view mode
 *   ?compare=true  — compare vs prior year toggle
 */
export function useDashboardParams() {
  const [quarter, setQuarter] = useQueryState(
    "q",
    parseAsString.withDefault("Q2 FY2026")
  )

  const [view, setView] = useQueryState(
    "view",
    parseAsStringEnum<ViewMode>(["quarterly", "ttm", "yoy"]).withDefault("quarterly")
  )

  const [compare, setCompare] = useQueryState(
    "compare",
    parseAsString.withDefault("")
  )

  function getShareUrl(): string {
    if (typeof window === "undefined") return ""
    return window.location.href
  }

  function copyShareUrl(): Promise<void> {
    return navigator.clipboard.writeText(getShareUrl())
  }

  return {
    quarter,
    setQuarter,
    view,
    setView,
    compareActive: compare === "true",
    toggleCompare: () => setCompare(compare === "true" ? "" : "true"),
    copyShareUrl,
    getShareUrl,
  }
}