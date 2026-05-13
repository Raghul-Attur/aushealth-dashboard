/**
 * Shared utility — no "use client" directive, safe to import from server or client.
 */
export type PeriodOption = "4" | "8" | "all"

export function getPeriodCount(n: string | undefined): number {
  if (n === "4") return 4
  if (n === "all") return 20
  return 8
}