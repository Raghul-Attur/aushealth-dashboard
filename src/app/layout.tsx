import type { Metadata } from "next"
import {
  Fraunces,
  Inter,
  JetBrains_Mono,
  Instrument_Serif,
} from "next/font/google"
import { IconDefs } from "@/components/icons/icon-defs"
import { Providers } from "./providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  variable: "--font-fraunces",
  display: "swap",
})

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
})

export const metadata: Metadata = {
  title: "AusHealth · Group Performance",
  description:
    "Executive dashboard for Australian private health insurance performance.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} ${fraunces.variable} ${instrumentSerif.variable}`}
    >
      <body>
        <IconDefs />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}