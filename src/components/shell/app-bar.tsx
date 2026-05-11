"use client"

import { Bell, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { StoryModeToggle } from "./story-mode-toggle"

const tabs = [
  { href: "/overview", label: "Overview" },
  { href: "/financial", label: "Financial" },
  { href: "/customer", label: "Customer" },
  { href: "/operational", label: "Operational" },
  { href: "/risk", label: "Risk & Capital" },
]

export function AppBar() {
  const pathname = usePathname()

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        background: "var(--color-surface-raised)",
        borderColor: "var(--color-border-subtle)",
      }}
    >
      <div className="mx-auto max-w-[1440px] px-8">
        {/* Top row */}
        <div className="h-12 flex items-center justify-between gap-6">
          {/* Left: wordmark + breadcrumb */}
          <div className="flex items-center gap-3">
            {/* Plus icon wordmark */}
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white"
                style={{ background: "var(--color-accent)" }}
              >
                +
              </div>
              <span
                className="text-[13px] font-semibold tracking-[0.04em] uppercase"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}
              >
                AusHealth
              </span>
            </div>
            <span style={{ color: "var(--color-border-default)" }}>·</span>
            <span className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
              Group performance
            </span>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-1">
            <StoryModeToggle />
            <div
              className="w-px h-5 mx-2"
              style={{ background: "var(--color-border-subtle)" }}
            />
            <button
              aria-label="Search"
              className="p-2 rounded-lg transition-colors hover:bg-subtle"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <Search size={16} strokeWidth={1.75} />
            </button>
            <button
              aria-label="Notifications"
              className="p-2 rounded-lg transition-colors hover:bg-subtle"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <Bell size={16} strokeWidth={1.75} />
            </button>
            {/* Avatar */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold ml-1"
              style={{
                background: "var(--color-accent)",
                color: "#ffffff",
              }}
            >
              RS
            </div>
          </div>
        </div>

        {/* Tab strip */}
        <nav className="flex items-center gap-0 -mb-px">
          {tabs.map((tab) => {
            const active = pathname === tab.href || (tab.href !== "/" && pathname.startsWith(tab.href))
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative px-4 py-2.5 text-[13px] transition-colors whitespace-nowrap"
                style={{
                  color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  fontWeight: active ? 500 : 400,
                  borderBottom: active
                    ? "2px solid var(--color-text-primary)"
                    : "2px solid transparent",
                }}
              >
                {tab.label}
              </Link>
            )
          })}

          {/* Quarter selector pill — right aligned */}
          <div className="ml-auto mb-1">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium"
              style={{
                background: "var(--color-inverse)",
                color: "#ffffff",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#4ade80" }}
              />
              Q2 FY2026 · Industry aggregate
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}