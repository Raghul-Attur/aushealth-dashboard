"use client"

import { Icon } from "@/components/icons/icon-defs"
import { StoryModeToggle } from "@/components/shell/story-mode-toggle"

export function AppBar() {
  return (
    <header className="relative z-[5]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-10 pt-6">
        {/* Brand */}
        <div className="flex items-center gap-3 text-bupa-navy">
          <div
            className="relative h-8 w-8 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, #6cc1ed 0%, #0079c8 55%, #0a1f44 95%)",
              boxShadow:
                "inset 0 0 0 1px rgba(255,255,255,0.55), 0 6px 16px rgba(0,85,142,0.3)",
            }}
            aria-hidden
          >
            <span className="absolute inset-0 flex items-center justify-center font-sans text-[18px] font-bold leading-none text-white">
              +
            </span>
          </div>
          <div className="font-sans text-[13px] font-semibold tracking-[0.18em]">
            <span className="text-bupa-navy">AUSHEALTH</span>
            <span className="ml-1.5 font-medium tracking-[0.08em] text-text-tertiary">
              · Group performance
            </span>
          </div>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full glass-strong px-3.5 py-2 text-caption font-medium text-text-primary">
            <span
              className="h-1.5 w-1.5 rounded-full bg-bupa-blue"
              style={{ boxShadow: "0 0 0 3px rgba(0,121,200,0.18)" }}
            />
            Q2 FY2026 · Industry aggregate
          </span>

          <StoryModeToggle />

          <button
            aria-label="Search"
            className="glass-strong inline-flex h-9 w-9 items-center justify-center rounded-full text-bupa-navy transition-colors hover:bg-bupa-navy hover:text-white"
          >
            <Icon name="search" />
          </button>
          <button
            aria-label="Notifications"
            className="glass-strong inline-flex h-9 w-9 items-center justify-center rounded-full text-bupa-navy transition-colors hover:bg-bupa-navy hover:text-white"
          >
            <Icon name="bell" />
          </button>

          <div
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/90 text-caption font-semibold text-white"
            style={{
              background: "linear-gradient(135deg, #0a1f44, #0079c8)",
              boxShadow: "0 4px 14px -4px rgba(10,31,68,0.4)",
            }}
          >
            RS
          </div>
        </div>
      </div>
    </header>
  )
}
