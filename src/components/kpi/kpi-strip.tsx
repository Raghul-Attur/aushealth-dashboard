"use client"

import { motion } from "framer-motion"

type Props = { children: React.ReactNode }

export function KpiStrip({ children }: Props) {
  return (
    <motion.div
      variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
      initial="hidden"
      animate="visible"
      // Mobile: 2 cols, tablet: 3 cols, desktop: 5 cols
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"
    >
      {children}
    </motion.div>
  )
}