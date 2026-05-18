"use client"

import { useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { X, MessageSquare, Plus, Trash2 } from "lucide-react"
import { useAnnotations, type AnnotationStatus } from "@/stores/annotations"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect } from "react"

const statusConfig: Record<AnnotationStatus, { label: string; bg: string; text: string; border: string }> = {
  fyi:     { label: "FYI",              bg: "rgba(0,47,108,0.06)",  text: "var(--color-bupa-navy)",  border: "rgba(0,47,108,0.14)"  },
  discuss: { label: "Needs discussion", bg: "var(--color-warning-bg)", text: "var(--color-warning)",     border: "rgba(176,122,10,0.25)" },
  action:  { label: "Action required",  bg: "var(--color-negative-bg)", text: "var(--color-negative)",   border: "rgba(192,57,43,0.25)"  },
}


const boardMembers = ["RS", "EM", "JT", "PK", "DK"]

type Props = {
  tileId: string
  tileLabel: string
}

export function AnnotationPopover({ tileId, tileLabel }: Props) {
  const { annotations, add, remove, forTile } = useAnnotations()
  const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
const tileAnnotations = mounted ? forTile(tileId) : []

  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [status, setStatus] = useState<AnnotationStatus>("fyi")
  const [tagged, setTagged] = useState<string[]>([])
  const [author] = useState("RS")

  const hasAnnotations = tileAnnotations.length > 0

  function handleAdd() {
    if (!text.trim()) return
    add({ tileId, text: text.trim(), status, author, taggedUsers: tagged })
    setText("")
    setStatus("fyi")
    setTagged([])
  }

  function toggleTag(initials: string) {
    setTagged((prev) =>
      prev.includes(initials) ? prev.filter((t) => t !== initials) : [...prev, initials]
    )
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={`Annotations for ${tileLabel}`}
          className="relative flex items-center justify-center w-6 h-6 rounded-full transition-all"
          style={{
            background: hasAnnotations ? "var(--color-bupa-blue)" : "transparent",
            border: hasAnnotations ? "none" : "1.5px solid rgba(0,47,108,0.18)",
            color: hasAnnotations ? "#fff" : "var(--color-text-tertiary)",
          }}
        >
          <MessageSquare size={11} strokeWidth={2} />
          {hasAnnotations && (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full font-sans font-bold"
              style={{ fontSize: "9px", background: "var(--color-negative)", color: "#fff" }}
            >
              {tileAnnotations.length}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="z-50"
          style={{ width: "320px" }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.18 }}
            style={{
              background: "var(--color-surface-raised)",
              borderRadius: "16px",
              border: "1px solid var(--color-border-subtle)",
              boxShadow: "0 20px 50px -10px rgba(0,47,108,0.25), 0 4px 16px -4px rgba(0,47,108,0.12)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b"
              style={{ borderColor: "var(--color-border-subtle)" }}>
              <div className="font-sans text-[12px] font-semibold" style={{ color: "var(--color-bupa-navy)" }}>
                {tileLabel}
              </div>
              <Popover.Close asChild>
                <button type="button" className="flex items-center justify-center w-6 h-6 rounded-full hover:bg-subtle"
                  style={{ color: "var(--color-text-tertiary)" }}>
                  <X size={12} strokeWidth={2} />
                </button>
              </Popover.Close>
            </div>

            {/* Existing annotations */}
            {tileAnnotations.length > 0 && (
              <div className="px-4 pt-3 space-y-2 max-h-[200px] overflow-y-auto">
                <AnimatePresence>
                  {tileAnnotations.map((ann) => {
                    const cfg = statusConfig[ann.status]
                    return (
                      <motion.div key={ann.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="rounded-xl p-3"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full font-sans font-bold text-white text-[9px]"
                                style={{ background: "var(--color-bupa-navy)" }}>
                                {ann.author}
                              </span>
                              <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.1em]"
                                style={{ color: cfg.text }}>
                                {cfg.label}
                              </span>
                              {ann.taggedUsers.length > 0 && (
                                <span className="font-sans text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
                                  → {ann.taggedUsers.join(", ")}
                                </span>
                              )}
                            </div>
                            <p className="font-sans text-[12px] leading-snug" style={{ color: "var(--color-text-primary)" }}>
                              {ann.text}
                            </p>
                            <p className="font-sans text-[10px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                              {new Date(ann.createdAt).toLocaleDateString("en-AU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <button type="button" onClick={() => remove(ann.id)}
                            className="flex-shrink-0 hover:text-negative transition-colors"
                            style={{ color: "var(--color-text-tertiary)" }}>
                            <Trash2 size={11} strokeWidth={1.75} />
                          </button>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* New annotation form */}
            <div className="px-4 py-3 space-y-3">
              {/* Status picker */}
              <div className="flex gap-1.5">
                {(Object.keys(statusConfig) as AnnotationStatus[]).map((s) => {
                  const cfg = statusConfig[s]
                  return (
                    <button key={s} type="button" onClick={() => setStatus(s)}
                      className="flex-1 py-1.5 rounded-lg font-sans text-[10px] font-semibold transition-all"
                      style={{
                        background: status === s ? cfg.bg : "var(--color-subtle)",
                        color: status === s ? cfg.text : "var(--color-text-tertiary)",
                        border: status === s ? `1px solid ${cfg.border}` : "1px solid transparent",
                      }}>
                      {cfg.label}
                    </button>
                  )
                })}
              </div>

              {/* Tag members */}
              <div className="flex items-center gap-1.5">
                <span className="font-sans text-[10px] uppercase tracking-[0.1em] flex-shrink-0"
                  style={{ color: "var(--color-text-tertiary)" }}>Notify</span>
                <div className="flex gap-1">
                  {boardMembers.filter((m) => m !== author).map((m) => (
                    <button key={m} type="button" onClick={() => toggleTag(m)}
                      className="w-6 h-6 rounded-full font-sans font-bold text-[9px] transition-all"
                      style={{
                        background: tagged.includes(m) ? "var(--color-bupa-blue)" : "var(--color-subtle)",
                        color: tagged.includes(m) ? "#fff" : "var(--color-text-tertiary)",
                        border: tagged.includes(m) ? "none" : "1px solid var(--color-border-subtle)",
                      }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text input */}
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a note for the board..."
                rows={2}
                className="w-full font-sans text-[12px] leading-relaxed resize-none rounded-xl px-3 py-2.5 outline-none transition-colors"
                style={{
                  background: "var(--color-subtle)",
                  border: "1px solid var(--color-border-subtle)",
                  color: "var(--color-text-primary)",
                  caretColor: "var(--color-bupa-blue)",
                }}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAdd() }}
              />

              {/* Submit */}
              <button type="button" onClick={handleAdd}
                disabled={!text.trim()}
                className="w-full flex items-center justify-center gap-2 font-sans text-[12px] font-semibold h-9 rounded-xl transition-all"
                style={{
                  background: text.trim() ? "var(--color-bupa-navy)" : "var(--color-subtle)",
                  color: text.trim() ? "#fff" : "var(--color-text-tertiary)",
                  cursor: text.trim() ? "pointer" : "not-allowed",
                }}>
                <Plus size={13} strokeWidth={2.5} />
                Add note
              </button>
            </div>
          </motion.div>

        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}