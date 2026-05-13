"use client"

import { motion } from "framer-motion"
import { staggerContainer } from "@/lib/motion"

export function KpiStrip({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid gap-3.5"
      style={{
        gridTemplateColumns: "1.4fr 1fr 1fr 1fr 1fr",
      }}
    >
      {children}
    </motion.div>
  )
}