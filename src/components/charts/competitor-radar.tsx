"use client"

import { ResponsiveRadar } from "@nivo/radar"

type RadarMetric = {
  metric: string
  bupa: number
  medibank: number
  max: number
  higherIsBetter: boolean
}

type Props = { metrics: RadarMetric[] }

export function CompetitorRadar({ metrics }: Props) {
  const data = metrics.map((m) => {
    const bupaScore = m.higherIsBetter
      ? (m.bupa / m.max) * 100
      : ((m.max - m.bupa) / m.max) * 100
    const medibankScore = m.higherIsBetter
      ? (m.medibank / m.max) * 100
      : ((m.max - m.medibank) / m.max) * 100
    return {
      metric: m.metric,
      Bupa: Math.round(bupaScore),
      Medibank: Math.round(medibankScore),
    }
  })

  return (
    <div style={{ height: 320 }}>
      <ResponsiveRadar
        data={data}
        keys={["Bupa", "Medibank"]}
        indexBy="metric"
        maxValue={100}
        margin={{ top: 24, right: 80, bottom: 24, left: 80 }}
        curve="linearClosed"
        borderWidth={2}
        borderColor={[{ id: "Bupa", color: "#0079C8" }, { id: "Medibank", color: "#00857C" }] as any}
        gridLevels={4}
        gridShape="circular"
        gridLabelOffset={14}
        enableDots
        dotSize={7}
        dotColor="#ffffff"
        dotBorderWidth={2.5}
        dotBorderColor={[{ id: "Bupa", color: "#0079C8" }, { id: "Medibank", color: "#00857C" }] as any}
        enableDotLabel={false}
        fillOpacity={0.12}
        blendMode="normal"
        animate
        colors={["#0079C8", "#00857C"]}
        theme={{
          axis: {
            ticks: {
              text: {
                fontSize: 11,
                fontFamily: "var(--font-sans)",
                fill: "var(--color-text-tertiary)",
              },
            },
          },
          grid: {
            line: {
              stroke: "rgba(0,47,108,0.1)",
              strokeWidth: 1,
            },
          },
        }}
        legends={[]}
      />
    </div>
  )
}