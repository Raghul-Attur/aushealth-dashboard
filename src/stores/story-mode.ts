"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type StoryModeState = {
  active: boolean
  toggle: () => void
  setActive: (active: boolean) => void
}

export const useStoryMode = create<StoryModeState>()(
  persist(
    (set) => ({
      active: false,
      toggle: () => set((s) => ({ active: !s.active })),
      setActive: (active) => set({ active }),
    }),
    {
      name: "aushealth-story-mode",
    }
  )
)