'use client'

import { AlertTriangle, CheckCircle2, Info, ReceiptText, RefreshCw } from 'lucide-react'
import { money } from '../constants'
import ReceiptScanProductList from './ReceiptScanProductList'
import type { ScanReceiptResponse } from './types'
import { confidenceColor, confidenceLabel } from './utils'

function textValue(value: string | null): string {
  return value?.trim() || 'No detectado'
}

function moneyValue(value: number | null, currency: string = 'UYU'): string {
  return value === null ? 'No detectado' : money(value, currency)
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.08] py-2 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-xs font-bold text-foreground">{value}</span>
    </div>
  )
}

function EmptyState({ scanning }: { scanning: boolean }) {
  return (
    <div className="mt-4 border-t border-white/[0.08] pt-4 text-xs text-muted-foreground">
      {scanning
        ? 'Analizando el ticket. El resumen va a aparecer acá para revisarlo antes de aplicarlo.'
        : 'Subí una imagen y analizá el ticket para ver el resumen antes de aplicar los datos.'}
    </div>
  )
}

export default function ReceiptScanReviewPanel({
  result, scanning, onClear, onApply,
}: {
  result: ScanReceiptResponse | null
  scanning: boolean
  onClear: () => void
  onApply: () => void
}) {
  const itemsTotal = result?.items.reduce((sum, item) => sum + item.totalPrice, 0) ?? 0
  const isLowConfidence = result ? result.confidence < 0.75 : false

  return (
    <section className="h-full rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-white/[0.055] to-white/[0.025] p-4 shadow-sm xl:sticky xl:top-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
            <ReceiptText className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Resumen del escaneo</h2>
            <p className="text-xs text-muted-foreground">Compará los datos con el ticket.</p>
          </div>
        </div>
        {result && (
          <span className={`shrink-0 text-[10px] font-bold ${confidenceColor(result.confidence)}`}>
            {confidenceLabel(result.confidence)} ({Math.round(result.confidence * 100)}%)
          </span>
        )}
      </div>

      {!result ? <EmptyState scanning={scanning} /> : (
        <>
          <div className="mt-4 border-y border-white/[0.08]">
            <SummaryRow label="Comercio" value={textValue(result.merchant)} />
            <SummaryRow label="Fecha" value={textValue(result.receiptDate)} />
            <SummaryRow label="Total pagado" value={moneyValue(result.total, result.currency)} />
            <SummaryRow label="Suma de ítems" value={money(itemsTotal, result.currency)} />
            <SummaryRow label="Descuentos" value={result.discounts === null ? 'No detectado' : `-${money(result.discounts, result.currency)}`} />
            <SummaryRow label="Medio de pago" value={textValue(result.paymentMethod)} />
            <SummaryRow label="Productos" value={String(result.items.length)} />
          </div>

          {result.items.length > 0 && <ReceiptScanProductList items={result.items} />}

          {isLowConfidence && (
            <div className="mt-4 flex items-start gap-3 border-t border-warning/40 pt-3 text-xs text-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>La confianza del escaneo es baja. Revisá y corregí los datos manualmente.</span>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="mt-4 flex items-start gap-3 border-t border-white/[0.08] pt-3 text-xs text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <ul className="list-inside list-disc space-y-0.5">
                {result.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
              </ul>
            </div>
          )}

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <button type="button" onClick={onClear} disabled={scanning}
              className="flex items-center justify-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-muted-foreground transition hover:bg-white/[0.08] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              <RefreshCw className="h-3.5 w-3.5" />
              Limpiar
            </button>
            <button type="button" onClick={onApply} disabled={scanning}
              className="flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Aplicar datos
            </button>
          </div>
        </>
      )}
    </section>
  )
}
