'use client'

import { AlertTriangle, Info, RefreshCw } from 'lucide-react'
import { confidenceColor, confidenceLabel } from './utils'

export default function ReceiptScanResultWarning({
  confidence, warnings, onClear,
}: {
  confidence: number
  warnings: string[]
  onClear: () => void
}) {
  const isLowConfidence = confidence < 0.75

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border bg-lh-surface p-4 text-sm shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-foreground">Revisá los datos antes de guardar</span>
          <span className={`text-xs font-bold ${confidenceColor(confidence)}`}>
            {confidenceLabel(confidence)} ({Math.round(confidence * 100)}%)
          </span>
        </div>
      </div>

      {isLowConfidence && (
        <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <span>La confianza del escaneo es baja. Revisá y corregí los datos manualmente.</span>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface-soft p-4 text-sm text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <ul className="list-inside list-disc space-y-1">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={onClear}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface-soft px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <RefreshCw className="h-4 w-4" />
        Limpiar resultado del escaneo
      </button>
    </div>
  )
}
