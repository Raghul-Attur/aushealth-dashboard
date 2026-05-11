type Props = {
  eyebrow?: string
  title: string
  /** A word in the title to render in accent purple — e.g. "and" in "Revenue and claims" */
  accentWord?: string
  subtitle?: string
  right?: React.ReactNode
}

export function SectionHeader({ eyebrow, title, accentWord, subtitle, right }: Props) {
  // Split title around the accent word
  let titleContent: React.ReactNode = title
  if (accentWord && title.includes(accentWord)) {
    const parts = title.split(accentWord)
    titleContent = (
      <>
        {parts[0]}
        <span style={{ color: "var(--color-accent)" }}>{accentWord}</span>
        {parts[1]}
      </>
    )
  }

  return (
    <div className="flex items-start justify-between gap-6 mb-1">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-micro uppercase tracking-wider text-text-tertiary mb-1">
            {eyebrow}
          </div>
        )}
        <h2
          className="leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "22px",
            fontWeight: 800,
            color: "var(--color-text-primary)",
          }}
        >
          {titleContent}
        </h2>
        {subtitle && (
          <p className="text-body-sm text-text-secondary mt-1 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  )
}