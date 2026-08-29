import { AlertTriangle, CheckCircle2, ReceiptText, Save, ArrowRight } from 'lucide-react'
import { money } from './constants'

export default function ExpenseSummary({
  itemsTotal, declaredTotal, discounts, difference, hasBlockingDifference, isSupermarketExpense,
  itemsCount, canSubmit, isSubmitting, error, success,
  onSubmit, onGoToMovements,
}: {
  itemsTotal: number; declaredTotal: number; discounts: number; difference: number
  hasBlockingDifference: boolean; isSupermarketExpense: boolean
  itemsCount: number; canSubmit: boolean; isSubmitting: boolean
  error: string | null; success: string | null
  onSubmit: () => void
  onGoToMovements: () => void
}) {
  const hasItems = itemsCount > 0
  const hasAnyDifference = hasItems && Math.abs(difference) > 0
  const statusText = hasBlockingDifference
    ? 'La suma de ítems no coincide con el total declarado.'
    : hasAnyDifference
      ? 'La diferencia está dentro del redondeo permitido.'
      : hasItems
        ? 'Los ítems coinciden con el total declarado.'
        : 'Podés guardar el gasto general sin productos.'

  return (
    <aside className="rounded-xl border-[0.5px] border-white/[0.08] bg-[#121214]/60 backdrop-blur-[20px] p-4 transition-all duration-200 select-none flex flex-col gap-3">
      {/* Header plano */}
      <div className="pb-3 border-b-[0.5px] border-white/[0.08] flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <ReceiptText className="h-[18px] w-[18px] text-foreground" />
          <h2 className="text-[15px] font-medium text-foreground">Resumen</h2>
        </div>
        <p className="text-xs text-muted-foreground">La diferencia por redondeo es $0.05.</p>
      </div>

      {/* Lista de filas */}
      <div className="border-b border-white/[0.08] pb-1">
        <SummaryRow label="Total declarado" value={money(declaredTotal)} />
        <SummaryRow label="Suma de ítems" value={money(itemsTotal)} />
        <SummaryRow label="Descuentos" value={discounts > 0 ? `-${money(discounts)}` : money(0)} />
        <SummaryRow label="Diferencia" value={money(difference)} danger={hasBlockingDifference} />
      </div>

      {/* Mensaje de estado en una línea */}
      <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
        {hasBlockingDifference ? (
          <AlertTriangle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
        )}
        <span className="truncate">{statusText}</span>
      </div>

      {/* Nota informativa sin borde ni fondo */}
      {isSupermarketExpense && itemsCount === 0 && (
        <div className="text-xs text-muted-foreground p-3 select-none leading-relaxed">
          Para compras de súper conviene cargar productos; después esto alimenta las categorías mensuales.
        </div>
      )}

      {error && (
        <div className="flex gap-2.5 rounded-lg border border-danger/30 bg-danger/5 p-3 text-xs text-danger">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="space-y-2">
          <div className="flex gap-2.5 rounded-lg border border-success/30 bg-success/5 p-3 text-xs text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
          <button 
            type="button" 
            onClick={onGoToMovements}
            className="flex w-full items-center justify-center gap-1.5 h-11 rounded-lg border border-white/10 bg-white/[0.02] text-sm font-medium text-foreground hover:bg-white/[0.06] transition-colors focus:outline-none"
          >
            Ver en movimientos
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Botón Guardar gasto en estilo secundario (outline) */}
      <button 
        type="submit" 
        disabled={!canSubmit || isSubmitting} 
        onClick={onSubmit}
        className="w-full flex items-center justify-center gap-1.5 h-11 rounded-lg border border-white/10 bg-white/[0.02] text-sm font-medium text-foreground hover:bg-white/[0.06] transition-colors focus:outline-none disabled:opacity-50"
      >
        <Save className="h-4 w-4 text-muted-foreground" />
        {isSubmitting ? 'Guardando…' : 'Guardar gasto'}
      </button>
    </aside>
  )
}

function SummaryRow({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-2.5 last:border-b-0">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${danger ? 'text-danger' : 'text-foreground'}`}>{value}</span>
    </div>
  )
}
