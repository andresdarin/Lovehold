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
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-2.5 last:border-b-0">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-8 text-center bg-transparent">
      <p className="text-[13px] text-muted-foreground leading-relaxed">
        Subí una imagen y analizá el ticket para ver el resumen antes de aplicar los datos.
      </p>
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
    <section className="rounded-xl border-[0.5px] border-white/[0.08] bg-[#121214]/60 backdrop-blur-[20px] p-4 transition-all duration-200 select-none">
      {/* Header plano */}
      <div className="pb-3 border-b-[0.5px] border-white/[0.08] flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <FileText className="h-[18px] w-[18px] text-foreground" />
          <h2 className="text-[15px] font-medium text-foreground">Resumen del escaneo</h2>
        </div>
        <p className="text-xs text-muted-foreground">Compará los datos con el ticket.</p>
      </div>

      {!result ? <EmptyState /> : (
        <div className="mt-3 flex flex-col gap-3">
          <div className="border-b border-white/[0.08]">
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
            <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>La confianza del escaneo es baja. Revisá y corregí los datos manualmente.</span>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div className="flex items-start gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] p-3 text-xs text-muted-foreground">
              <Info className="h-4 w-4 shrink-0 mt-0.5" />
              <ul className="list-inside list-disc space-y-0.5">
                {result.warnings.map((warning, index) => <li key={index}>{warning}</li>)}
              </ul>
            </div>
          )}

          {/* Botones de acción en estilo secundario (sin color primario) */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button 
              type="button" 
              onClick={onClear} 
              disabled={scanning}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] py-2 text-xs font-medium text-foreground hover:bg-white/[0.06] transition-colors focus:outline-none disabled:opacity-50"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Limpiar
            </button>
            <button 
              type="button" 
              onClick={onApply} 
              disabled={scanning}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] py-2 text-xs font-medium text-foreground hover:bg-white/[0.06] transition-colors focus:outline-none disabled:opacity-50"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Aplicar datos
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
