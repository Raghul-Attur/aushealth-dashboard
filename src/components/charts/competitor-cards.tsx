"use client"

import { TrendingUp } from "lucide-react"

type Period = {
  revenue: number
  netProfit: number
  members: number
  lossRatio: number
  netMargin: number
  marketShare: number | null
  benefitsPaid: number
  memberGrowth: number
}

type Props = { bupa: Period; medibank: Period; industry: Period }

const BUPA_COLOR = "#0079C8"
const MEDIBANK_COLOR = "#00857C"

// Stable formatters — no locale-dependent formatting
const fmtB = (n: number) => `$${(n / 1e9).toFixed(1)}B`
const fmtM = (n: number) => `${(n / 1e6).toFixed(1)}M`
const fmtPct = (n: number) => `${n.toFixed(1)}%`
const fmtGrowth = (n: number) => `+${n.toFixed(1)}%`

export function CompetitorCards({ bupa, medibank, industry }: Props) {
  const metrics = [
    { label: "Revenue", bupaVal: bupa.revenue, medibankVal: medibank.revenue, industryVal: industry.revenue, format: fmtB, higherIsBetter: true },
    { label: "Net profit", bupaVal: bupa.netProfit, medibankVal: medibank.netProfit, industryVal: industry.netProfit, format: fmtB, higherIsBetter: true },
    { label: "Net margin", bupaVal: bupa.netMargin * 100, medibankVal: medibank.netMargin * 100, industryVal: industry.netMargin * 100, format: fmtPct, higherIsBetter: true },
    { label: "Loss ratio", bupaVal: bupa.lossRatio * 100, medibankVal: medibank.lossRatio * 100, industryVal: industry.lossRatio * 100, format: fmtPct, higherIsBetter: false },
    { label: "Members", bupaVal: bupa.members, medibankVal: medibank.members, industryVal: industry.members, format: fmtM, higherIsBetter: true },
    { label: "Member growth", bupaVal: bupa.memberGrowth * 100, medibankVal: medibank.memberGrowth * 100, industryVal: industry.memberGrowth * 100, format: fmtGrowth, higherIsBetter: true },
  ]

  return (
    <div className="space-y-2">
      {/* Column headers */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
        <div />
        {[
          { label: "Bupa Australia", color: BUPA_COLOR },
          { label: "Medibank Private", color: MEDIBANK_COLOR },
          { label: "Industry avg", color: "var(--color-text-tertiary)" },
        ].map(({ label, color }) => (
          <div key={label} className="font-sans font-bold text-[12px] text-center pb-2"
            style={{ color, borderBottom: `2px solid ${color}` }}>
            {label}
          </div>
        ))}
      </div>

      {/* Metric rows */}
      {metrics.map((m) => {
        const bupaWins = m.higherIsBetter ? m.bupaVal >= m.medibankVal : m.bupaVal <= m.medibankVal
        const medibankWins = !bupaWins
        return (
          <div key={m.label} className="grid gap-3 items-center rounded-2xl py-3 px-1 hover:bg-white/50 transition-colors"
            style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
            <div className="font-sans font-semibold text-[11px] uppercase tracking-[0.08em]"
              style={{ color: "var(--color-text-tertiary)" }}>
              {m.label}
            </div>
            <div className="text-center">
              <div className="font-sans font-bold text-[20px] tracking-[-0.025em]"
                style={{ color: bupaWins ? BUPA_COLOR : "var(--color-text-primary)" }}>
                {m.format(m.bupaVal)}
              </div>
              {bupaWins && (
                <div className="inline-flex items-center gap-1 mt-1 font-sans text-[10px] font-semibold rounded-full px-2 py-0.5"
                  style={{ background: `${BUPA_COLOR}18`, color: BUPA_COLOR }}>
                  <TrendingUp size={9} strokeWidth={2.5} /> Leader
                </div>
              )}
            </div>
            <div className="text-center">
              <div className="font-sans font-bold text-[20px] tracking-[-0.025em]"
                style={{ color: medibankWins ? MEDIBANK_COLOR : "var(--color-text-primary)" }}>
                {m.format(m.medibankVal)}
              </div>
              {medibankWins && (
                <div className="inline-flex items-center gap-1 mt-1 font-sans text-[10px] font-semibold rounded-full px-2 py-0.5"
                  style={{ background: `${MEDIBANK_COLOR}18`, color: MEDIBANK_COLOR }}>
                  <TrendingUp size={9} strokeWidth={2.5} /> Leader
                </div>
              )}
            </div>
            <div className="text-center font-sans text-[16px]"
              style={{ color: "var(--color-text-tertiary)" }}>
              {m.format(m.industryVal)}
            </div>
          </div>
        )
      })}
    </div>
  )
}