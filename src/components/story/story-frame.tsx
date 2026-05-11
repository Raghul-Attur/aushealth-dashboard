"use client"

import { useStoryMode } from "@/stores/story-mode"
import { AnimatePresence, motion } from "framer-motion"

type Props = {
  story: React.ReactNode
  explore: React.ReactNode
}

/**
 * Renders either story or explore content depending on global mode.
 * Crossfades between modes with a brief delay for the "settle" feel.
 */
export function StoryFrame({ story, explore }: Props) {
  const { active } = useStoryMode()

  return (
    <AnimatePresence mode="wait">
      {active ? (
        <motion.div
          key="story"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="max-w-[1080px] mx-auto">{story}</div>
        </motion.div>
      ) : (
        <motion.div
          key="explore"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        >
          {explore}
        </motion.div>
      )}
    </AnimatePresence>
  )
}