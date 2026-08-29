import { AlertTriangle, CheckCircle2, Info, FileText, RefreshCw } from 'lucide-react'
import { money } from '../constants'
import ReceiptScanProductList from './ReceiptScanProductList'
import type { ScanReceiptResponse } from './types'

function textValue(value: string | null): string {
  return value?.trim() || 'No detectado'
}

function moneyValue(value: number | null, currency: string = 'UYU'): string {
  return value === null ? 'No detectado' : money(value, currency)
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 py-2.5 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-bold text-foreground tabular-nums">{value}</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-6 flex flex-col items-center justify-center text-center bg-transparent gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#407E8C]/30 bg-[#C0D5D6]/20 text-primary shadow-2xs">
        <FileText className="h-4 w-4 stroke-[2.2]" />
      </div>
      <div>
        <p className="text-xs font-bold text-foreground">Sin datos leídos aún</p>
        <p className="text-[11px] text-muted-foreground max-w-[260px] mt-0.5 leading-relaxed">
          Subí una imagen y analizá el comprobante para ver el desglose antes de aplicar.
        </p>
      </div>
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
    <section className="rounded-3xl border border-border/80 bg-surface p-4 sm:p-5 shadow-xs transition-all select-none flex flex-col gap-3.5">
      {/* Header con Badge de Estado */}
      <div className="pb-3 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary">
            <FileText className="h-3.5 w-3.5 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-foreground">Revisión del escaneo</h2>
            <p className="text-[11px] text-muted-foreground">Datos detectados por inteligencia artificial.</p>
          </div>
        </div>
        {result && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full">
            <CheckCircle2 className="h-3 w-3" />
            Detectado
          </span>
        )}
      </div>

      {!result ? <EmptyState /> : (
        <div className="flex flex-col gap-3">
          <div className="rounded-2xl border border-border/60 bg-surface-soft/40 p-3 flex flex-col">
            <SummaryRow label="Comercio" value={textValue(result.merchant)} />
            <SummaryRow label="Fecha" value={textValue(result.receiptDate)} />
            <SummaryRow label="Total detectado" value={moneyValue(result.total, result.currency)} />
            <SummaryRow label="Suma de productos" value={money(itemsTotal, result.currency)} />
            {result.discounts !== null && result.discounts > 0 && (
              <SummaryRow label="Descuentos" value={`-${money(result.discounts, result.currency)}`} />
            )}
            <SummaryRow label="Medio de pago" value={textValue(result.paymentMethod)} />
            <SummaryRow label="Productos leídos" value={String(result.items.length)} />
          </div>

          {result.items.length > 0 && <ReceiptScanProductList items={result.items} />}

          {isLowConfidence && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-warning/30 bg-warning/5 p-3 text-xs text-warning font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Confianza moderada. Revisá los montos antes de aplicar.</span>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-border/80 bg-surface-soft p-3 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <ul className="list-inside list-disc space-y-0.5">
                {result.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
              </ul>
            </div>
          )}

          {/* Botones de acción */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button 
              type="button" 
              onClick={onClear} 
              disabled={scanning}
              className="flex items-center justify-center gap-1.5 rounded-2xl border border-border/80 bg-surface-soft py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-surface transition-colors focus:outline-none disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Limpiar
            </button>
            <button 
              type="button" 
              onClick={onApply} 
              disabled={scanning}
              className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary-hover transition-all focus:outline-none disabled:opacity-50 active:scale-95"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Aplicar al gasto
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
