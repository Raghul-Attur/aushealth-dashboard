"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "/overview", label: "Overview" },
  { href: "/financial", label: "Financial" },
  { href: "/customer", label: "Customer" },
  { href: "/operational", label: "Operational" },
]

export function TabStrip() {
  const pathname = usePathname()

  return (
    <div className="border-b border-border-subtle bg-surface">
      <div className="mx-auto max-w-[1440px] px-8 flex gap-6">
        {tabs.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "py-3 text-body-sm transition-colors relative",
                active ? "text-text-primary font-medium" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {tab.label}
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-inverse" aria-hidden />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}