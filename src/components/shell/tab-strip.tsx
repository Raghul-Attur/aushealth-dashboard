"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Icon, type IconName } from "@/components/icons/icon-defs"
import { cn } from "@/lib/utils"

type Tab = { href: string; label: string; icon: IconName }

const tabs: Tab[] = [
  { href: "/overview", label: "Overview", icon: "chart-pie" },
  { href: "/financial", label: "Financial", icon: "coin" },
  { href: "/customer", label: "Customer", icon: "users" },
  { href: "/operational", label: "Operational", icon: "activity" },
]

export function TabStrip() {
  const pathname = usePathname()

  return (
    <nav className="relative z-[3]">
      <div className="mx-auto flex max-w-[1440px] items-center gap-1 px-10 pt-4">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "inline-flex items-center gap-[7px] rounded-full px-3.5 py-2 font-sans text-body-sm font-medium transition-all",
                active
                  ? "bg-bupa-navy text-white"
                  : "text-text-secondary hover:bg-white/45 hover:text-bupa-navy"
              )}
              style={
                active
                  ? { boxShadow: "0 8px 20px -8px rgba(10,31,68,0.5)" }
                  : undefined
              }
            >
              <Icon name={tab.icon} size="sm" />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
