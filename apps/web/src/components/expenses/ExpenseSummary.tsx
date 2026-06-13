'use client'

import { AlertTriangle, CheckCircle2, Calculator, Save, ArrowRight } from 'lucide-react'
import LiquidGlass from '@/components/ui/LiquidGlass'
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
    <aside className="rounded-2xl border border-border bg-surface p-5 shadow-sm xl:sticky xl:top-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
          <Calculator className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Resumen</h2>
          <p className="text-sm text-muted-foreground">La diferencia permitida por redondeo es $0.05.</p>
        </div>
      </div>

      <div className="mt-5 divide-y divide-border/70 border-y border-border/70">
        <SummaryRow label="Total declarado" value={money(declaredTotal)} />
        <SummaryRow label="Suma de ítems" value={money(itemsTotal)} />
        <SummaryRow label="Descuentos" value={discounts > 0 ? `-${money(discounts)}` : money(0)} />
        <SummaryRow label="Diferencia" value={money(difference)} danger={hasBlockingDifference} />
      </div>

      <div className={`mt-4 flex gap-3 rounded-xl border p-4 text-sm ${hasBlockingDifference ? 'border-danger/40 bg-danger/10 text-danger' : 'border-border bg-surface-soft text-muted-foreground'}`}>
        {hasBlockingDifference ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />}
        <span>{statusText}</span>
      </div>

      {isSupermarketExpense && itemsCount === 0 && (
        <div className="mt-4 rounded-xl border border-border bg-surface-soft p-4 text-sm text-muted-foreground">
          Para compras de súper conviene cargar productos: después esto alimenta las categorías mensuales.
        </div>
      )}

      {error && (
        <div className="mt-4 flex gap-3 rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 space-y-3">
          <div className="flex gap-3 rounded-xl border border-success/40 bg-success/10 p-4 text-sm text-success">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
          <button type="button" onClick={onGoToMovements}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary/25 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            Ver en movimientos
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <LiquidGlass variant="button" intensity="medium" disabled={!canSubmit} className="mt-5 block">
        <button type="submit" disabled={!canSubmit} onClick={onSubmit}
          className="flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-foreground disabled:cursor-not-allowed focus-visible:outline-none">
          <Save className="h-4 w-4 text-primary" />
          {isSubmitting ? 'Guardando…' : 'Guardar gasto'}
        </button>
      </LiquidGlass>
    </aside>
  )
}

function SummaryRow({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold ${danger ? 'text-danger' : 'text-foreground'}`}>{value}</span>
    </div>
  )
}
