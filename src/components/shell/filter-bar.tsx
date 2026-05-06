"use client"

export function FilterBar() {
  return (
    <div className="bg-subtle border-b border-border-subtle">
      <div className="mx-auto max-w-[1440px] px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterPill label="Last 8 quarters" />
          <FilterPill label="All Australia" />
          <FilterPill label="Industry aggregate" />
        </div>
        <div className="text-caption text-text-secondary flex items-center gap-3">
          <span>Showing: All Australia · Last 8 quarters · Industry aggregate</span>
          <button className="text-info hover:underline">Reset</button>
        </div>
      </div>
    </div>
  )
}

function FilterPill({ label }: { label: string }) {
  return (
    <button className="bg-surface border border-border-subtle rounded-md px-3 h-8 text-caption flex items-center gap-1 hover:border-border-default transition-colors">
      {label}
      <span className="text-text-tertiary">▾</span>
    </button>
  )
}