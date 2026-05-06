import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Bupa Group Performance",
  description: "Executive dashboard for private health insurance performance",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}