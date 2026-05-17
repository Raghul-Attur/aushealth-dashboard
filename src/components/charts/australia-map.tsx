"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import type { CoverageState } from "@/lib/data/schemas"
import { fmt } from "@/lib/format"

type Props = {
  states: CoverageState[]
  metric: "htCoverage" | "gtCoverage"
}

// State name mapping from GeoJSON properties to our abbreviations
const NAME_TO_ABBR: Record<string, string> = {
  "New South Wales": "NSW",
  "Victoria": "VIC",
  "Queensland": "QLD",
  "South Australia": "SA",
  "Western Australia": "WA",
  "Tasmania": "TAS",
  "Northern Territory": "NT",
  "Australian Capital Territory": "ACT",
}

export function AustraliaMap({ states, metric }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<{ state: CoverageState; x: number; y: number } | null>(null)
  const [geoData, setGeoData] = useState<any>(null)
  const [error, setError] = useState(false)

  const dataByAbbr: Record<string, CoverageState> = {}
  states.forEach((s) => { dataByAbbr[s.state] = s })

  const values = states.map((s) => s[metric])
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)

  // Fetch real Australia GeoJSON from CDN
  useEffect(() => {
    fetch("https://raw.githubusercontent.com/rowanhogan/australian-states/master/states.geojson")
      .then((r) => r.json())
      .then(setGeoData)
      .catch(() => setError(true))
  }, [])

  useEffect(() => {
    if (!geoData || !svgRef.current) return

    const container = containerRef.current
    const width = container?.clientWidth ?? 520
    const height = 400

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()
    svg.attr("viewBox", `0 0 ${width} ${height}`)

    // ── Defs: shadow + gradients for 3D effect ──
    const defs = svg.append("defs")

    // Drop shadow for depth
    const shadow = defs.append("filter")
      .attr("id", "au-shadow")
      .attr("x", "-30%").attr("y", "-30%")
      .attr("width", "160%").attr("height", "160%")

    shadow.append("feDropShadow")
      .attr("dx", 3).attr("dy", 5).attr("stdDeviation", 6)
      .attr("flood-color", "rgba(0,47,108,0.35)")
      .attr("flood-opacity", 1)

    // Specular highlight gradient for each state (top-left light source)
    defs.append("linearGradient")
      .attr("id", "au-gloss")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "60%").attr("y2", "100%")
      .selectAll("stop")
      .data([
        { offset: "0%", color: "rgba(255,255,255,0.28)" },
        { offset: "45%", color: "rgba(255,255,255,0.06)" },
        { offset: "100%", color: "rgba(0,0,0,0.12)" },
      ])
      .join("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color)

    // Colour scale — Bupa navy intensity
    const colorScale = d3.scaleLinear<string>()
        .domain([minVal, (minVal + maxVal) / 2, maxVal])
        .range(["#E8F4FB", "#0079C8", "#002F6C"])
        .interpolate(d3.interpolateRgb) as any

    // ── 3D effect: use geoAlbers but offset each state slightly ──
    // True 3D via perspective tilt: rotate projection + CSS perspective
    const projection = d3.geoMercator()
      .center([134, -28])
      .scale(width * 1.05)
      .translate([width * 0.46, height * 0.5])

    const pathGen = d3.geoPath().projection(projection)

    // Background ocean circle for globe feel
    svg.append("ellipse")
      .attr("cx", width / 2).attr("cy", height / 2 + 10)
      .attr("rx", width * 0.48).attr("ry", height * 0.42)
      .attr("fill", "rgba(0,121,200,0.06)")
      .attr("stroke", "rgba(0,47,108,0.08)")
      .attr("stroke-width", 1)

    // ── Draw states ──
    const g = svg.append("g")
      .style("filter", "url(#au-shadow)")

    geoData.features.forEach((feature: any) => {
      const stateName = feature.properties?.STATE_NAME || feature.properties?.name || ""
      const abbr = NAME_TO_ABBR[stateName] || stateName
      const stateData = dataByAbbr[abbr]
      const value = stateData ? stateData[metric] : minVal
      const baseColor = stateData ? colorScale(value) : "#D5E8F5"

      const stateG = g.append("g").attr("class", `state-${abbr}`)

      // Base fill — the coloured state shape
      stateG.append("path")
        .datum(feature)
        .attr("d", pathGen as any)
        .attr("fill", baseColor)
        .attr("stroke", "white")
        .attr("stroke-width", 1.2)
        .attr("stroke-linejoin", "round")
        .style("cursor", "pointer")
        .style("transition", "filter 0.15s ease")
        .on("mouseover", function(event) {
          d3.select(this)
            .attr("stroke-width", 2.5)
            .attr("stroke", "#fff")
          const brighter = d3.color(baseColor)!.brighter(0.5).toString()
          d3.select(this).attr("fill", brighter)
          if (stateData) {
            const rect = svgRef.current!.getBoundingClientRect()
            setTooltip({ state: stateData, x: event.clientX - rect.left, y: event.clientY - rect.top })
          }
        })
        .on("mousemove", function(event) {
          const rect = svgRef.current!.getBoundingClientRect()
          setTooltip((t) => t ? { ...t, x: event.clientX - rect.left, y: event.clientY - rect.top } : null)
        })
        .on("mouseleave", function() {
          d3.select(this)
            .attr("fill", baseColor)
            .attr("stroke-width", 1.2)
            .attr("stroke", "white")
          setTooltip(null)
        })

      // Gloss overlay for 3D sheen
      stateG.append("path")
        .datum(feature)
        .attr("d", pathGen as any)
        .attr("fill", "url(#au-gloss)")
        .attr("pointer-events", "none")

      // Label at centroid
      const centroid = pathGen.centroid(feature)
      if (!isNaN(centroid[0]) && !isNaN(centroid[1])) {
        const isSmall = ["ACT", "TAS"].includes(abbr)
        const isDark = stateData && value > (minVal + maxVal) * 0.55

        stateG.append("text")
          .attr("x", centroid[0])
          .attr("y", centroid[1] - (isSmall ? 0 : 5))
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-family", "var(--font-sans)")
          .attr("font-size", isSmall ? "8px" : "11px")
          .attr("font-weight", "800")
          .attr("fill", isDark ? "rgba(255,255,255,0.95)" : "rgba(0,47,108,0.85)")
          .attr("pointer-events", "none")
          .attr("letter-spacing", "0.05em")
          .text(abbr)

        if (!isSmall && stateData) {
          stateG.append("text")
            .attr("x", centroid[0])
            .attr("y", centroid[1] + 11)
            .attr("text-anchor", "middle")
            .attr("font-family", "var(--font-sans)")
            .attr("font-size", "10px")
            .attr("font-weight", "600")
            .attr("fill", isDark ? "rgba(255,255,255,0.78)" : "rgba(0,47,108,0.65)")
            .attr("pointer-events", "none")
            .text(fmt.percent(value))
        }
      }
    })

  }, [geoData, states, metric, minVal, maxVal])

  return (
    <div ref={containerRef} className="relative w-full"
      style={{
        height: 400,
        // CSS 3D perspective tilt
        perspective: "900px",
      }}>
      <div style={{
        width: "100%",
        height: "100%",
        transform: "rotateX(12deg) rotateZ(-1deg)",
        transformOrigin: "center 60%",
        transformStyle: "preserve-3d",
      }}>
        {error ? (
          <div className="flex items-center justify-center h-full font-sans text-[13px]"
            style={{ color: "var(--color-text-tertiary)" }}>
            Map unavailable — check network connection.
          </div>
        ) : !geoData ? (
          <div className="flex items-center justify-center h-full font-sans text-[13px]"
            style={{ color: "var(--color-text-tertiary)" }}>
            Loading map…
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full" />
        )}
      </div>

      {/* Colour legend */}
      <div className="absolute bottom-3 left-4 flex items-center gap-2"
        style={{ zIndex: 10 }}>
        <div style={{
          width: 72, height: 7, borderRadius: 4,
          background: "linear-gradient(to right, #C8DFF5, #002F6C)",
          border: "1px solid rgba(0,47,108,0.15)",
        }} />
        <span className="font-sans text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
          {fmt.percent(minVal)} → {fmt.percent(maxVal)}
        </span>
      </div>

      {/* Tooltip — rendered outside the 3D transform */}
      {tooltip && (
        <div className="pointer-events-none absolute z-20"
          style={{
            left: Math.min(tooltip.x + 14, 340),
            top: Math.max(tooltip.y - 80, 8),
            background: "var(--color-bupa-navy)",
            color: "#fff",
            borderRadius: "12px",
            padding: "10px 14px",
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            boxShadow: "0 8px 24px -6px rgba(0,47,108,0.5)",
            minWidth: "148px",
          }}>
          <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "6px", letterSpacing: "-0.015em" }}>
            {tooltip.state.state}
          </div>
          {[
            { label: "HT coverage", value: fmt.percent(tooltip.state.htCoverage) },
            { label: "GT coverage", value: fmt.percent(tooltip.state.gtCoverage) },
            { label: "HT insured",  value: fmt.number(tooltip.state.htInsured)   },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: "14px", marginBottom: "2px", opacity: 0.85 }}>
              <span style={{ opacity: 0.7 }}>{label}</span>
              <span style={{ fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}