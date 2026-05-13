"use client"

type Props = {
  values: number[]
  width?: number
  height?: number
  labels?: string[]
  static?: boolean
  inverse?: boolean
  dark?: boolean
  /** Explicit stroke colour — overrides default logic */
  color?: string
}

export function Sparkline({
  values,
  width = 96,
  height = 32,
  static: isStatic = false,
  inverse = false,
  dark = false,
  color,
}: Props) {
  if (values.length < 2) return null

  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const padX = 2
  const padY = 4

  const pts = values.map((v, i) => {
    const x = padX + (i / (values.length - 1)) * (width - padX * 2)
    const y = height - padY - ((v - min) / range) * (height - padY * 2)
    return [x, y] as [number, number]
  })

  // Smooth bezier path
  const path = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x.toFixed(1)},${y.toFixed(1)}`
    const [px, py] = pts[i - 1]
    const cpx = ((px + x) / 2).toFixed(1)
    return `${acc} C${cpx},${py.toFixed(1)} ${cpx},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`
  }, "")

  const last = pts[pts.length - 1]
  const trendUp = values[values.length - 1] >= values[0]
  const trendIsGood = inverse ? !trendUp : trendUp

  // Colour logic
  let strokeColor: string
  let fillColor: string
  let dotColor: string

  if (color) {
    strokeColor = color
    fillColor = color
    dotColor = color
  } else if (dark) {
    strokeColor = trendIsGood ? "#4ade80" : "#f87171"
    fillColor = trendIsGood ? "#4ade80" : "#f87171"
    dotColor = trendIsGood ? "#4ade80" : "#f87171"
  } else {
    strokeColor = trendIsGood ? "var(--color-positive)" : "var(--color-negative)"
    fillColor = trendIsGood ? "var(--color-positive)" : "var(--color-negative)"
    dotColor = trendIsGood ? "var(--color-positive)" : "var(--color-negative)"
  }

  const areaPath = `${path} L${last[0].toFixed(1)},${(height - padY).toFixed(1)} L${padX},${(height - padY).toFixed(1)} Z`

  const gradId = `spark-grad-${Math.random().toString(36).slice(2, 7)}`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: "visible", display: "block" }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={dark ? 0.5 : 0.22} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={1}
      />

      {/* End dot */}
      <circle
        cx={last[0]}
        cy={last[1]}
        r={3.5}
        fill={dotColor}
        stroke={dark ? "rgba(255,255,255,0.2)" : "white"}
        strokeWidth={1.5}
      />
    </svg>
  )
}