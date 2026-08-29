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
    <aside className="rounded-3xl border border-border bg-surface p-5 shadow-xs transition-all flex flex-col gap-4">
      {/* Header */}
      <div className="pb-3 border-b border-border/70 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <ReceiptText className="h-[18px] w-[18px] text-primary" />
          <h2 className="text-sm font-bold text-foreground">Resumen</h2>
        </div>
        <p className="text-xs text-muted-foreground">La diferencia por redondeo es $0.05.</p>
      </div>

      {/* Lista de filas */}
      <div className="border-b border-border/70 pb-1">
        <SummaryRow label="Total declarado" value={money(declaredTotal)} />
        <SummaryRow label="Suma de ítems" value={money(itemsTotal)} />
        <SummaryRow label="Descuentos" value={discounts > 0 ? `-${money(discounts)}` : money(0)} />
        <SummaryRow label="Diferencia" value={money(difference)} danger={hasBlockingDifference} />
      </div>

      {/* Mensaje de estado */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {hasBlockingDifference ? (
          <AlertTriangle className="h-4 w-4 text-danger shrink-0" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
        )}
        <span className="truncate font-medium">{statusText}</span>
      </div>

      {/* Nota informativa */}
      {isSupermarketExpense && itemsCount === 0 && (
        <div className="text-xs text-muted-foreground p-3 rounded-2xl bg-surface-soft select-none leading-relaxed">
          Para compras de súper conviene cargar productos; después esto alimenta las categorías mensuales.
        </div>
      )}

      {error && (
        <div className="flex gap-2.5 rounded-2xl border border-danger/30 bg-danger/5 p-3.5 text-xs text-danger font-medium">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="space-y-2">
          <div className="flex gap-2.5 rounded-2xl border border-success/30 bg-success/5 p-3.5 text-xs text-success font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
          <button 
            type="button" 
            onClick={onGoToMovements}
            className="flex w-full items-center justify-center gap-1.5 h-11 rounded-2xl border border-border bg-surface-soft text-sm font-semibold text-foreground hover:bg-surface-alt transition-colors focus:outline-none"
          >
            Ver en movimientos
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Botón Guardar gasto */}
      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        onClick={onSubmit}
        className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-xs hover:bg-primary-hover transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
      >
        <Save className="h-4 w-4" />
        {isSubmitting ? 'Guardando…' : 'Guardar gasto'}
      </button>
    </aside>
  )
}

function SummaryRow({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 py-2.5 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${danger ? 'text-danger' : 'text-foreground'}`}>{value}</span>
    </div>
  )
}
