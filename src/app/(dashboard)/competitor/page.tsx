import { SectionHeader } from "@/components/layout/section-header"
import { CompetitorCards } from "@/components/charts/competitor-cards"
import { CompetitorRadar } from "@/components/charts/competitor-radar"
import { CompetitorTimeline } from "@/components/charts/competitor-timeline"
import { Icon } from "@/components/icons/icon-defs"
import { fmt } from "@/lib/format"
import competitorData from "@/lib/data/competitor.json"

export default function CompetitorPage() {
  const { insurers, radarMetrics } = competitorData
  const bupa = insurers.find(i => i.id === "bupa")!
  const medibank = insurers.find(i => i.id === "medibank")!
  const industry = insurers.find(i => i.id === "industry")!

  const bupaLatest = bupa.periods.at(-1)!
  const medibankLatest = medibank.periods.at(-1)!
  const industryLatest = industry.periods.at(-1)!

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="glass">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="inline-flex items-center gap-2 font-sans text-[11px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: "var(--color-bupa-blue-deep)" }}>
              <Icon name="activity" size="sm" style={{ color: "var(--color-bupa-blue)" }} />
              Competitive intelligence · FY2024
            </div>
            <h1 className="mt-3 font-sans font-bold"
              style={{ fontSize: "clamp(28px, 4vw, 56px)", lineHeight: 0.96, letterSpacing: "-0.03em", color: "var(--color-bupa-navy)" }}>
              Bupa vs{" "}
              <span style={{ color: "var(--color-positive)" }}>Medibank.</span>
            </h1>
            <p className="mt-4 max-w-[560px] font-sans text-[14px] leading-[1.65]"
              style={{ color: "var(--color-text-secondary)" }}>
              Side-by-side performance comparison across revenue, profitability, membership and claims. Data sourced from Medibank ASX filings and Bupa APAC annual results.
            </p>
          </div>

          {/* Source badges */}
          <div className="flex flex-col gap-3">
            {[
              { name: "Bupa Australia", color: bupa.color, desc: "FY2024 Annual Results", members: fmt.number(bupaLatest.members) },
              { name: "Medibank Private", color: medibank.color, desc: "FY2024 ASX Filing", members: fmt.number(medibankLatest.members) },
            ].map((ins) => (
              <div key={ins.name} className="inline-flex items-center gap-3 rounded-2xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,47,108,0.08)" }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl font-sans font-bold text-[15px] text-white flex-shrink-0"
                  style={{ background: ins.color }}>
                  {ins.name[0]}
                </div>
                <div>
                  <div className="font-sans font-semibold text-[13px]" style={{ color: "var(--color-bupa-navy)" }}>{ins.name}</div>
                  <div className="font-sans text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{ins.members} members · {ins.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-side KPI cards */}
      <div className="glass">
        <SectionHeader
          title="Head-to-head metrics."
          subtitle="Key performance indicators for the most recent full financial year." />
        <div className="mt-5">
          <CompetitorCards bupa={bupaLatest} medibank={medibankLatest} industry={industryLatest} />
        </div>
      </div>

      {/* Radar + Timeline grid */}
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-5 glass">
          <SectionHeader
            title="Performance radar."
            subtitle="Multi-dimensional comparison across 6 key metrics. Larger area = better overall performance." />
          <div className="mt-4">
            <CompetitorRadar metrics={radarMetrics} />
          </div>
          <div className="mt-4 flex items-center gap-5 font-sans text-[12px]"
            style={{ color: "var(--color-text-secondary)" }}>
            {[
              { label: "Bupa", color: bupa.color },
              { label: "Medibank", color: medibank.color },
            ].map(({ label, color }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-7 glass">
          <SectionHeader
            title="3-year performance timeline."
            subtitle="Revenue, net profit and loss ratio trend for both insurers across FY2022–FY2024." />
          <div className="mt-4">
            <CompetitorTimeline bupa={bupa.periods} medibank={medibank.periods} />
          </div>
        </div>
      </div>

      {/* Detail table */}
      <div className="glass">
        <SectionHeader
          title="Full comparison table."
          subtitle="All metrics side-by-side for the latest period." />
        <div className="mt-5 overflow-x-auto">
          <table className="w-full font-sans text-[13px] tabular">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border-subtle)", color: "var(--color-text-tertiary)" }}>
                {["Metric", "Bupa Australia", "Medibank Private", "Industry avg", "Leader"].map((h, i) => (
                  <th key={h} className={`py-3 font-sans text-[11px] font-semibold uppercase tracking-[0.1em] ${i === 0 ? "text-left pr-4" : "text-right px-4"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Revenue", bupa: fmt.currency(bupaLatest.revenue), medibank: fmt.currency(medibankLatest.revenue), industry: fmt.currency(industryLatest.revenue), leader: bupaLatest.revenue > medibankLatest.revenue ? "Bupa" : "Medibank", leaderColor: bupa.color },
                { label: "Net profit", bupa: fmt.currency(bupaLatest.netProfit), medibank: fmt.currency(medibankLatest.netProfit), industry: fmt.currency(industryLatest.netProfit), leader: bupaLatest.netProfit > medibankLatest.netProfit ? "Bupa" : "Medibank", leaderColor: bupaLatest.netProfit > medibankLatest.netProfit ? bupa.color : medibank.color },
                { label: "Net margin", bupa: fmt.percent(bupaLatest.netMargin), medibank: fmt.percent(medibankLatest.netMargin), industry: fmt.percent(industryLatest.netMargin), leader: "Tied", leaderColor: "var(--color-text-tertiary)" },
                { label: "Loss ratio", bupa: fmt.percent(bupaLatest.lossRatio), medibank: fmt.percent(medibankLatest.lossRatio), industry: fmt.percent(industryLatest.lossRatio), leader: bupaLatest.lossRatio < medibankLatest.lossRatio ? "Bupa" : "Medibank", leaderColor: bupaLatest.lossRatio < medibankLatest.lossRatio ? bupa.color : medibank.color },
                { label: "Members", bupa: fmt.number(bupaLatest.members), medibank: fmt.number(medibankLatest.members), industry: fmt.number(industryLatest.members), leader: bupaLatest.members > medibankLatest.members ? "Bupa" : "Medibank", leaderColor: bupa.color },
                { label: "Member growth", bupa: fmt.percent(bupaLatest.memberGrowth), medibank: fmt.percent(medibankLatest.memberGrowth), industry: fmt.percent(industryLatest.memberGrowth), leader: bupaLatest.memberGrowth > medibankLatest.memberGrowth ? "Bupa" : "Medibank", leaderColor: bupaLatest.memberGrowth > medibankLatest.memberGrowth ? bupa.color : medibank.color },
                { label: "Benefits paid", bupa: fmt.currency(bupaLatest.benefitsPaid), medibank: fmt.currency(medibankLatest.benefitsPaid), industry: fmt.currency(industryLatest.benefitsPaid), leader: "N/A", leaderColor: "var(--color-text-tertiary)" },
                { label: "Market share", bupa: fmt.percent(bupaLatest.marketShare ?? 0), medibank: fmt.percent(medibankLatest.marketShare ?? 0), industry: "–", leader: bupaLatest.marketShare! > medibankLatest.marketShare! ? "Bupa" : "Medibank", leaderColor: bupa.color },
              ].map((row, i) => (
                <tr key={row.label} className="hover:bg-white/40 transition-colors"
                  style={{ borderBottom: "0.5px solid var(--color-border-subtle)" }}>
                  <td className="py-3 pr-4 font-semibold" style={{ color: "var(--color-bupa-navy)" }}>{row.label}</td>
                  <td className="py-3 px-4 text-right" style={{ color: "var(--color-text-primary)" }}>{row.bupa}</td>
                  <td className="py-3 px-4 text-right" style={{ color: "var(--color-text-primary)" }}>{row.medibank}</td>
                  <td className="py-3 px-4 text-right" style={{ color: "var(--color-text-tertiary)" }}>{row.industry}</td>
                  <td className="py-3 pl-4 text-right">
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 font-sans text-[11px] font-semibold text-white"
                      style={{ background: row.leaderColor }}>
                      {row.leader}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 font-sans text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
          Sources: Medibank FY2024 ASX Appendix 4E (22 Aug 2024); Bupa APAC FY2024 Annual Results (7 Mar 2025). Loss ratio lower is better. Market share estimated from APRA member data.
        </p>
      </div>
    </div>
  )
}