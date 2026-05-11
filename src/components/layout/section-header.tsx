import { Icon, type IconName } from "@/components/icons/icon-defs"

type Props = {
  eyebrow?: string
  eyebrowIcon?: IconName
  title: string
  /** Italic emphasis word inside the title, set in Bupa blue. */
  emphasis?: string
  subtitle?: string
  right?: React.ReactNode
}

/**
 * Section header in the Bupa editorial register: serif title with an optional
 * italic accent word, italic Fraunces subtitle, eyebrow with optional icon.
 *
 * If `emphasis` is provided, the title is split on that substring and the
 * matching span is rendered as italic Bupa-blue. Pass plain `title` for no
 * emphasis treatment.
 */
export function SectionHeader({
  eyebrow,
  eyebrowIcon,
  title,
  emphasis,
  subtitle,
  right,
}: Props) {
  const renderTitle = () => {
    if (!emphasis) return title
    const idx = title.indexOf(emphasis)
    if (idx < 0) return title
    const before = title.slice(0, idx)
    const after = title.slice(idx + emphasis.length)
    return (
      <>
        {before}
        <em className="font-light italic text-bupa-blue">{emphasis}</em>
        {after}
      </>
    )
  }

  return (
    <div className="mb-2 flex items-start justify-between gap-6">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2 inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-bupa-blue-deep">
            {eyebrowIcon && (
              <Icon name={eyebrowIcon} size="sm" className="text-bupa-blue" />
            )}
            {eyebrow}
          </div>
        )}
        <h2
          className="font-serif text-[26px] font-light leading-[1.18] tracking-[-0.022em] text-bupa-navy lg:text-[34px]"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 40' }}
        >
          {renderTitle()}
        </h2>
        {subtitle && (
          <p className="mt-1 max-w-[640px] font-serif text-body font-light italic leading-[1.55] text-text-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  )
}
