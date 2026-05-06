"use client"

import { Bell, Command, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

const titles: Record<string, string> = {
  "/overview": "Overview",
  "/financial": "Financial",
  "/customer": "Customer",
  "/operational": "Operational",
}

export function AppBar() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const title = titles[pathname] ?? "Overview"

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <header className="bg-inverse text-text-inverse">
      <div className="mx-auto max-w-[1440px] px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-h2 font-semibold tracking-wide">AUSHEALTH</span>
          <span className="text-body-sm opacity-70">Group performance / {title}</span>
        </div>
        <div className="flex items-center gap-3">
          <button aria-label="Command menu" className="p-2 opacity-70 hover:opacity-100 transition-opacity">
            <Command size={18} strokeWidth={1.75} />
          </button>
          <button aria-label="Notifications" className="p-2 opacity-70 hover:opacity-100 transition-opacity">
            <Bell size={18} strokeWidth={1.75} />
          </button>
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 opacity-70 hover:opacity-100 transition-opacity"
          >
            {mounted && (theme === "dark" ? <Sun size={18} strokeWidth={1.75} /> : <Moon size={18} strokeWidth={1.75} />)}
          </button>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-caption">
            RS
          </div>
        </div>
      </div>
    </header>
  )
}
