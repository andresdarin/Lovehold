'use client'

import { X } from 'lucide-react'

export default function ReceiptImageModal({
  open, src, onClose,
}: {
  open: boolean
  src: string | null
  onClose: () => void
}) {
  if (!open || !src) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Imagen del ticket"
        className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-bold text-foreground">Imagen del ticket</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Cerrar imagen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="scrollbar-salmon overflow-auto bg-black/20 p-3">
          <img src={src} alt="Ticket escaneado" className="mx-auto max-h-[78vh] max-w-full rounded-xl object-contain" />
        </div>
      </div>
    </div>
  )
}
