"use client"

import { motion } from "framer-motion"
import { staggerContainer } from "@/lib/motion"

export function KpiStrip({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid grid-cols-2 lg:grid-cols-5 gap-3"
    >
      {children}
    </motion.div>
  )
}