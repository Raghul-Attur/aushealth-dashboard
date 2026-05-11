/**
 * Icon system: a single set of SVG <symbol> definitions mounted once at the
 * app root, referenced via <use> by the <Icon> component anywhere in the tree.
 *
 * Lucide-derived line style, 1.6 stroke weight, four sizes (sm/md/lg/xl).
 *
 * Coexists with lucide-react. Use this set for shell, headers, KPI labels,
 * watch list, and anywhere the Bupa visual language is in effect.
 */

export type IconName =
  | "trend-up"
  | "trend-down"
  | "pct"
  | "coin"
  | "shield-plus"
  | "activity"
  | "chart-pie"
  | "bar-chart"
  | "users"
  | "cog"
  | "bell"
  | "search"
  | "arrow-up-right"
  | "arrow-right"
  | "arrow-up"
  | "arrow-down"
  | "calendar"
  | "globe"
  | "download"
  | "eye"
  | "eye-open"
  | "alert"
  | "spark"
  | "doc"
  | "vault"
  | "stethoscope"
  | "sparkles"
  | "map-pin"
  | "layers"
  | "command"
  | "book-open"
  | "chevron-right"
  | "info"

type IconSize = "sm" | "md" | "lg" | "xl"

const sizeMap: Record<IconSize, number> = {
  sm: 13,
  md: 16,
  lg: 20,
  xl: 26,
}

export function Icon({
  name,
  size = "md",
  className = "",
  style,
  strokeWidth,
}: {
  name: IconName
  size?: IconSize
  className?: string
  style?: React.CSSProperties
  strokeWidth?: number
}) {
  const px = sizeMap[size]
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      className={className}
      style={{
        stroke: "currentColor",
        fill: "none",
        strokeWidth: strokeWidth ?? 1.6,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        display: "inline-block",
        verticalAlign: "-3px",
        flexShrink: 0,
        ...style,
      }}
      aria-hidden="true"
    >
      <use href={`#i-${name}`} />
    </svg>
  )
}

export function IconDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: "absolute" }}
      aria-hidden="true"
    >
      <defs>
        <symbol id="i-trend-up" viewBox="0 0 24 24">
          <polyline points="3 17 9 11 13 15 21 7" />
          <polyline points="14 7 21 7 21 14" />
        </symbol>
        <symbol id="i-trend-down" viewBox="0 0 24 24">
          <polyline points="3 7 9 13 13 9 21 17" />
          <polyline points="14 17 21 17 21 10" />
        </symbol>
        <symbol id="i-pct" viewBox="0 0 24 24">
          <line x1="19" y1="5" x2="5" y2="19" />
          <circle cx="6.5" cy="6.5" r="2.5" />
          <circle cx="17.5" cy="17.5" r="2.5" />
        </symbol>
        <symbol id="i-coin" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <path d="M15 9.5c-.4-1-1.6-1.5-3-1.5-1.7 0-3 .9-3 2 0 1.2 1.4 1.7 3 2 1.7.3 3 .8 3 2 0 1.1-1.3 2-3 2-1.4 0-2.6-.5-3-1.5" />
          <line x1="12" y1="6" x2="12" y2="8" />
          <line x1="12" y1="16" x2="12" y2="18" />
        </symbol>
        <symbol id="i-shield-plus" viewBox="0 0 24 24">
          <path d="M12 3 4 6v6c0 4.5 3.4 8.4 8 9 4.6-.6 8-4.5 8-9V6l-8-3Z" />
          <line x1="12" y1="9" x2="12" y2="15" />
          <line x1="9" y1="12" x2="15" y2="12" />
        </symbol>
        <symbol id="i-activity" viewBox="0 0 24 24">
          <polyline points="3 12 7 12 10 5 14 19 17 12 21 12" />
        </symbol>
        <symbol id="i-chart-pie" viewBox="0 0 24 24">
          <path d="M21 12A9 9 0 1 1 12 3v9h9Z" />
          <path d="M21 12a9 9 0 0 0-9-9v9h9Z" />
        </symbol>
        <symbol id="i-bar-chart" viewBox="0 0 24 24">
          <line x1="6" y1="20" x2="6" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="18" y1="20" x2="18" y2="14" />
          <line x1="3" y1="20" x2="21" y2="20" />
        </symbol>
        <symbol id="i-users" viewBox="0 0 24 24">
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M15.5 14.5c2.5.4 4.5 2.2 4.5 4.5" />
        </symbol>
        <symbol id="i-cog" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </symbol>
        <symbol id="i-bell" viewBox="0 0 24 24">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </symbol>
        <symbol id="i-search" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16" y2="16" />
        </symbol>
        <symbol id="i-arrow-up-right" viewBox="0 0 24 24">
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="8 7 17 7 17 16" />
        </symbol>
        <symbol id="i-arrow-right" viewBox="0 0 24 24">
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="13 6 19 12 13 18" />
        </symbol>
        <symbol id="i-arrow-up" viewBox="0 0 24 24">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="6 11 12 5 18 11" />
        </symbol>
        <symbol id="i-arrow-down" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" />
          <polyline points="6 13 12 19 18 13" />
        </symbol>
        <symbol id="i-calendar" viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="8" y1="3" x2="8" y2="7" />
          <line x1="16" y1="3" x2="16" y2="7" />
        </symbol>
        <symbol id="i-globe" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </symbol>
        <symbol id="i-download" viewBox="0 0 24 24">
          <path d="M12 4v12" />
          <polyline points="6 11 12 17 18 11" />
          <line x1="4" y1="20" x2="20" y2="20" />
        </symbol>
        <symbol id="i-eye" viewBox="0 0 24 24">
          <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </symbol>
        <symbol id="i-eye-open" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
        </symbol>
        <symbol id="i-alert" viewBox="0 0 24 24">
          <path d="M12 3 2 21h20L12 3Z" />
          <line x1="12" y1="10" x2="12" y2="14" />
          <circle cx="12" cy="17.5" r=".6" fill="currentColor" />
        </symbol>
        <symbol id="i-spark" viewBox="0 0 24 24">
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.5 5.5 8 8M16 16l2.5 2.5M5.5 18.5 8 16M16 8l2.5-2.5" />
        </symbol>
        <symbol id="i-doc" viewBox="0 0 24 24">
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
          <polyline points="14 3 14 8 19 8" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </symbol>
        <symbol id="i-vault" viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="14" cy="12" r="3" />
          <line x1="14" y1="8" x2="14" y2="9" />
          <line x1="14" y1="15" x2="14" y2="16" />
          <line x1="6" y1="9" x2="9" y2="9" />
          <line x1="6" y1="12" x2="9" y2="12" />
          <line x1="6" y1="15" x2="9" y2="15" />
        </symbol>
        <symbol id="i-stethoscope" viewBox="0 0 24 24">
          <path d="M6 3v6a4 4 0 0 0 8 0V3" />
          <line x1="6" y1="3" x2="4" y2="3" />
          <line x1="14" y1="3" x2="16" y2="3" />
          <path d="M10 13v3a4 4 0 0 0 8 0v-1" />
          <circle cx="18" cy="13" r="2" />
        </symbol>
        <symbol id="i-sparkles" viewBox="0 0 24 24">
          <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6Z" />
          <path d="M19 14l.7 2 2 .7-2 .7L19 19.4l-.7-2-2-.7 2-.7Z" />
        </symbol>
        <symbol id="i-map-pin" viewBox="0 0 24 24">
          <path d="M12 22s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13Z" />
          <circle cx="12" cy="9" r="3" />
        </symbol>
        <symbol id="i-layers" viewBox="0 0 24 24">
          <path d="m12 3 9 5-9 5-9-5 9-5Z" />
          <path d="m3 13 9 5 9-5" />
          <path d="m3 18 9 5 9-5" />
        </symbol>
        <symbol id="i-command" viewBox="0 0 24 24">
          <path d="M9 6a3 3 0 1 0-3 3h3V6Z" />
          <path d="M9 15v3a3 3 0 1 1-3-3h3Z" />
          <path d="M15 9V6a3 3 0 1 1 3 3h-3Z" />
          <path d="M15 15h3a3 3 0 1 1-3 3v-3Z" />
          <rect x="9" y="9" width="6" height="6" />
        </symbol>
        <symbol id="i-book-open" viewBox="0 0 24 24">
          <path d="M2 4h7a3 3 0 0 1 3 3v13a2.5 2.5 0 0 0-2.5-2.5H2V4Z" />
          <path d="M22 4h-7a3 3 0 0 0-3 3v13a2.5 2.5 0 0 1 2.5-2.5H22V4Z" />
        </symbol>
        <symbol id="i-chevron-right" viewBox="0 0 24 24">
          <polyline points="9 6 15 12 9 18" />
        </symbol>
        <symbol id="i-info" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="11" x2="12" y2="16" />
          <circle cx="12" cy="8" r=".6" fill="currentColor" />
        </symbol>
      </defs>
    </svg>
  )
}
