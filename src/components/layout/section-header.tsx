type Props = {
    eyebrow?: string
    title: string
    subtitle?: string
    right?: React.ReactNode
  }
  
  export function SectionHeader({ eyebrow, title, subtitle, right }: Props) {
    return (
      <div className="flex items-start justify-between gap-6 mb-1">
        <div className="min-w-0">
          {eyebrow && (
            <div className="text-micro uppercase tracking-wider text-text-tertiary mb-1">
              {eyebrow}
            </div>
          )}
          <h2 className="text-h1 leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-body-sm text-text-secondary mt-1 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
    )
  }