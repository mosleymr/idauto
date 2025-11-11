"use client"

import { useEffect, useRef } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const lastActive = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    lastActive.current = document.activeElement as HTMLElement | null
    const el = dialogRef.current
    // lock scroll
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // focus the dialog for accessibility
    setTimeout(() => el?.focus(), 0)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        // simple tab trap
        const focusable = el?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable || focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      // restore focus
      try { lastActive.current?.focus() } catch {
        // ignore
      }
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Dialog'}
        ref={dialogRef}
        tabIndex={-1}
        className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-800 rounded shadow-lg p-4 text-white"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="text-lg font-semibold">{title}</div>
          <div>
            <button type="button" onClick={onClose} className="text-sm text-white/60 hover:text-white">Close</button>
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
