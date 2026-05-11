"use client"

import { Icon, type IconName } from "@/components/icons/icon-defs"

export function FilterBar() {
  return (
    <div className="relative z-[3]">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-10 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <FilterPill icon="calendar" label="Last 8 quarters" />
          <FilterPill icon="map-pin" label="All Australia" />
          <FilterPill icon="layers" label="Industry aggregate" />
        </div>
        <div className="flex items-center gap-3 font-sans text-caption text-text-tertiary">
          <span className="hidden lg:inline">
            Showing: All Australia · Last 8 quarters · Industry aggregate
          </span>
          <button className="font-medium text-bupa-blue-deep hover:text-bupa-navy">
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

function FilterPill({ icon, label }: { icon: IconName; label: string }) {
  return (
    <button className="glass-strong inline-flex h-8 items-center gap-2 rounded-full px-3 font-sans text-caption font-medium text-text-secondary transition-colors hover:text-bupa-navy">
      <Icon name={icon} size="sm" className="text-bupa-blue-deep" />
      <span>{label}</span>
      <Icon name="chevron-right" size="sm" className="rotate-90 text-text-tertiary" />
    </button>
  )
}
