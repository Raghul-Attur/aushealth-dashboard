"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type AnnotationStatus = "fyi" | "discuss" | "action"

export type Annotation = {
  id: string
  tileId: string
  text: string
  status: AnnotationStatus
  author: string
  taggedUsers: string[]
  createdAt: string
}

type AnnotationState = {
  annotations: Annotation[]
  add: (annotation: Omit<Annotation, "id" | "createdAt">) => void
  remove: (id: string) => void
  forTile: (tileId: string) => Annotation[]
}

export const useAnnotations = create<AnnotationState>()(
  persist(
    (set, get) => ({
      annotations: [],
      add: (annotation) =>
        set((s) => ({
          annotations: [
            ...s.annotations,
            {
              ...annotation,
              id: Math.random().toString(36).slice(2, 10),
              createdAt: new Date().toISOString(),
            },
          ],
        })),
      remove: (id) =>
        set((s) => ({
          annotations: s.annotations.filter((a) => a.id !== id),
        })),
      forTile: (tileId) =>
        get().annotations.filter((a) => a.tileId === tileId),
    }),
    { name: "aushealth-annotations" }
  )
)