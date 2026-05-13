"use client"

import { useState } from "react"
import { Link, Check } from "lucide-react"
import { useDashboardParams } from "@/hooks/use-dashboard-params"

export function ShareButton() {
  const { copyShareUrl } = useDashboardParams()
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await copyShareUrl()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 font-sans text-[12px] font-medium transition-all"
      style={{
        background: copied ? "var(--color-positive-bg)" : "rgba(255,255,255,0.84)",
        color: copied ? "var(--color-positive)" : "var(--color-bupa-navy)",
        border: `1px solid ${copied ? "rgba(0,133,124,0.25)" : "rgba(0,47,108,0.12)"}`,
        borderRadius: "999px",
        padding: "0 14px",
        height: "34px",
        boxShadow: "0 4px 14px -6px rgba(0,47,108,0.18)",
        backdropFilter: "blur(20px)",
      }}
      title="Copy shareable link to current view"
    >
      {copied
        ? <><Check size={13} strokeWidth={2.5} />Copied</>
        : <><Link size={13} strokeWidth={1.75} />Share view</>
      }
    </button>
  )
}