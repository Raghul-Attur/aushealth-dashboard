"use client"

import { motion } from "framer-motion"
import { staggerContainer } from "@/lib/motion"

/**
 * Five-column KPI strip used on each tab. On the Overview tab the first tile
 * is rendered as a "deep" tint and may visually span 1.4fr. Pass
 * className="first:[&>*]:lg:col-span-1" to override grid behaviour if needed.
 */
export function KpiStrip({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className={`grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5 ${className}`}
    >
      {children}
    </motion.div>
  )
}
