'use client'

import { Eye, RefreshCw, Trash2 } from 'lucide-react'
import { money } from '../constants'
import type { ScanReceiptResponse } from './types'
import { confidenceColor, confidenceLabel } from './utils'

function textValue(value: string | null): string {
  return value?.trim() || 'No detectado'
}

function totalValue(value: number | null): string {
  return value === null ? 'No detectado' : money(value)
}

function CollapsedStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-foreground">{value}</p>
    </div>
  )
}

export default function ReceiptScanCollapsed({
  result, onViewImage, onReanalyze, onClear,
}: {
  result: ScanReceiptResponse
  onViewImage: () => void
  onReanalyze: () => void
  onClear: () => void
}) {
  const confidence = Math.round(result.confidence * 100)

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-foreground">Ticket aplicado</h2>
            <span className={`text-xs font-bold ${confidenceColor(result.confidence)}`}>
              {confidenceLabel(result.confidence)} ({confidence}%)
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">La imagen queda guardada para revisar sin ocupar la pantalla.</p>
        </div>
        <div className="grid gap-2 sm:flex sm:justify-end">
          <button type="button" onClick={onViewImage}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-soft px-3 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto">
            <Eye className="h-4 w-4 text-primary" />
            Ver imagen
          </button>
          <button type="button" onClick={onReanalyze}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-soft px-3 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:w-auto">
            <RefreshCw className="h-4 w-4 text-primary" />
            Reanalizar
          </button>
          <button type="button" onClick={onClear}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-soft px-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30 sm:w-auto">
            <Trash2 className="h-4 w-4" />
            Limpiar
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 border-t border-border pt-4 sm:grid-cols-2 lg:grid-cols-5">
        <CollapsedStat label="Comercio" value={textValue(result.merchant)} />
        <CollapsedStat label="Fecha" value={textValue(result.receiptDate)} />
        <CollapsedStat label="Total" value={totalValue(result.total)} />
        <CollapsedStat label="Productos" value={String(result.items.length)} />
        <CollapsedStat label="Confianza" value={`${confidence}%`} />
      </div>
    </section>
  )
}
