import { ShieldAlert } from "lucide-react"

type Props = {
  eyebrow?: string
  /** Main headline text — use {accent: "..."} syntax via accentWords prop */
  headline: string
  /** Words/phrase in the headline to render in amber italic */
  accentPhrase?: string
  body?: string
  metric?: string
  metricLabel?: string
}

export function InsightBanner({
  eyebrow = "Industry health · This quarter",
  headline,
  accentPhrase,
  body,
  metric,
  metricLabel,
}: Props) {
  // Split headline around the accent phrase
  let headlineContent: React.ReactNode = headline
  if (accentPhrase && headline.includes(accentPhrase)) {
    const parts = headline.split(accentPhrase)
    headlineContent = (
      <>
        {parts[0]}
        <em
          className="not-italic font-bold"
          style={{ color: "var(--color-warning)" }}
        >
          {accentPhrase}
        </em>
        {parts[1]}
      </>
    )
  }

  return (
    <div
      className="rounded-xl px-6 py-5"
      style={{
        background: "var(--color-warning-bg)",
        border: "0.5px solid",
        borderColor: "rgb(165 106 10 / 0.15)",
      }}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
          style={{
            background: "rgb(165 106 10 / 0.12)",
          }}
        >
          <ShieldAlert
            size={18}
            strokeWidth={1.75}
            style={{ color: "var(--color-warning)" }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {eyebrow && (
            <div
              className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-2"
              style={{ color: "var(--color-warning)" }}
            >
              {eyebrow}
            </div>
          )}
          <p
            className="text-[17px] font-bold leading-snug"
            style={{ color: "var(--color-text-primary)" }}
          >
            {headlineContent}
          </p>
          {body && (
            <p
              className="text-[13px] mt-2 leading-relaxed max-w-xl"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {body}
            </p>
          )}
        </div>

        {/* Metric callout */}
        {metric && (
          <div className="flex-shrink-0 text-right">
            <div
              className="tabular leading-none"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "36px",
                fontWeight: 800,
                color: "var(--color-text-primary)",
              }}
            >
              {metric}
            </div>
            {metricLabel && (
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.08em] mt-1"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {metricLabel}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}