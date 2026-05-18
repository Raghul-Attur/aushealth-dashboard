"use client"

import { Search, Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Icon } from "@/components/icons/icon-defs"
import { StoryModeToggle } from "./story-mode-toggle"
import { ShareButton } from "./share-button"
import { PeriodSelector } from "./period-selector"
import { SearchOverlay } from "./search-overlay"

const tabs = [
  { href: "/overview",    label: "Overview",    icon: "activity" as const },
  { href: "/financial",   label: "Financial",   icon: "coin" as const },
  { href: "/customer",    label: "Customer",    icon: "eye-open" as const },
  { href: "/operational", label: "Operational", icon: "activity" as const },
  { href: "/competitor", label: "Competitor", icon: "activity" as const },
]

export function AppBar() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const activeTab = tabs.find(t => pathname.startsWith(t.href)) ?? tabs[0]
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header
        className="relative z-40 sticky top-0"
        style={{
          background: "rgba(238, 243, 248, 0)",
          borderBottom: "1px solid rgba(0, 47, 108, 0)",
        }}
      >
        <div className="mx-auto max-w-[1440px] px-4 lg:px-10 h-14 flex items-center gap-3">

          {/* Brand */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-full relative flex-shrink-0"
              style={{
                background: "radial-gradient(circle at 32% 28%, #6cc1ed 0%, var(--color-bupa-blue) 55%, var(--color-bupa-navy) 95%)",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.55), 0 6px 16px rgba(0,85,142,0.3)",
              }}>
              <span className="absolute inset-0 flex items-center justify-center font-sans font-bold text-white"
                style={{ fontSize: "16px" }}>+</span>
            </div>
            <strong className="font-sans font-semibold tracking-[0.18em] uppercase text-[12px] hidden sm:block"
              style={{ color: "var(--color-bupa-navy)" }}>
              AusHealth
            </strong>
          </div>

          {/* Desktop nav — full labels, hidden below lg */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {tabs.map((tab) => {
              const active = pathname.startsWith(tab.href)
              return (
                <Link key={tab.href} href={tab.href}
                  className="inline-flex items-center gap-1.5 font-sans text-[13px] font-medium transition-all"
                  style={{
                    padding: "7px 14px", borderRadius: "999px",
                    color: active ? "#fff" : "var(--color-text-secondary)",
                    background: active ? "var(--color-bupa-navy)" : "transparent",
                    boxShadow: active ? "0 8px 20px -8px rgba(0,47,108,0.5)" : "none",
                    textDecoration: "none",
                  }}>
                  <Icon name={tab.icon} size="sm"
                    style={{ color: active ? "#fff" : "var(--color-text-tertiary)" }} />
                  {tab.label}
                </Link>
              )
            })}
          </nav>

          {/* Tablet nav — active tab only as pill + hamburger */}
          <div className="lg:hidden flex items-center gap-2 flex-1">
            <div className="inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold"
              style={{
                padding: "6px 14px", borderRadius: "999px",
                color: "#fff",
                background: "var(--color-bupa-navy)",
                boxShadow: "0 8px 20px -8px rgba(0,47,108,0.5)",
              }}>
              <Icon name={activeTab.icon} size="sm" style={{ color: "#fff" }} />
              {activeTab.label}
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Period selector — always visible but compact on mobile */}
            <PeriodSelector />

            {/* Desktop only */}
            <div className="hidden lg:flex items-center gap-1.5">
              <ShareButton />
              <StoryModeToggle />
              <button type="button" onClick={() => setSearchOpen(true)}
                className="inline-flex items-center justify-center"
                style={{
                  width: "34px", height: "34px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.84)",
                  border: "1px solid rgba(0,47,108,0.08)",
                  color: "var(--color-bupa-navy)",
                  backdropFilter: "blur(20px)",
                  cursor: "pointer",
                }}>
                <Search size={15} strokeWidth={1.75} />
              </button>
              <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
            </div>

            {/* Avatar */}
            <div className="inline-flex items-center justify-center font-sans text-[12px] font-semibold text-white"
              style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "linear-gradient(135deg, var(--color-bupa-navy), var(--color-bupa-blue))",
                border: "2px solid rgba(255,255,255,0.9)",
                boxShadow: "0 4px 14px -4px rgba(0,47,108,0.4)",
              }}>
              RS
            </div>

            {/* Hamburger — tablet/mobile only */}
            <button type="button"
              className="lg:hidden inline-flex items-center justify-center"
              style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "rgba(255,255,255,0.84)",
                border: "1px solid rgba(0,47,108,0.08)",
                color: "var(--color-bupa-navy)",
              }}
              onClick={() => setMobileMenuOpen(v => !v)}>
              {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile/tablet nav drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-14 z-30 px-4 pb-4"
          style={{
            background: "rgba(238,243,248,0.97)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(0,47,108,0.08)",
          }}>
          <nav className="flex flex-col gap-1 pt-3">
            {tabs.map((tab) => {
              const active = pathname.startsWith(tab.href)
              return (
                <Link key={tab.href} href={tab.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-3 font-sans text-[15px] font-medium px-4 py-3 rounded-xl transition-all"
                  style={{
                    color: active ? "#fff" : "var(--color-text-primary)",
                    background: active ? "var(--color-bupa-navy)" : "transparent",
                    textDecoration: "none",
                  }}>
                  <Icon name={tab.icon} size="sm"
                    style={{ color: active ? "#fff" : "var(--color-text-tertiary)" }} />
                  {tab.label}
                </Link>
              )
            })}
          </nav>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t"
            style={{ borderColor: "rgba(0,47,108,0.08)" }}>
            <ShareButton />
            <StoryModeToggle />
          </div>
        </div>
      )}
    </>
  )
}