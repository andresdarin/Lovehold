'use client'

import { AlertTriangle, CheckCircle2, Calculator, Save } from 'lucide-react'
import LiquidGlass from '@/components/ui/LiquidGlass'
import { money } from './constants'

export default function ExpenseSummary({
  itemsTotal, declaredTotal, difference, hasBlockingDifference, isSupermarketExpense,
  itemsCount, canSubmit, isSubmitting, error, success,
  onUseItemsTotal, onSubmit,
}: {
  itemsTotal: number; declaredTotal: number; difference: number
  hasBlockingDifference: boolean; isSupermarketExpense: boolean
  itemsCount: number; canSubmit: boolean; isSubmitting: boolean
  error: string | null; success: string | null
  onUseItemsTotal: () => void; onSubmit: () => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
          <Calculator className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Resumen</h2>
          <p className="text-sm text-muted-foreground">La diferencia permitida por redondeo es $0.05.</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <SummaryRow label="Total de ítems" value={money(itemsTotal)} />
        <SummaryRow label="Total declarado" value={money(declaredTotal)} />
        <SummaryRow label="Diferencia" value={money(difference)} danger={hasBlockingDifference} />
      </div>

      {itemsCount > 0 && (
        <button type="button" onClick={onUseItemsTotal}
          className="mt-4 w-full rounded-2xl border border-border bg-surface-soft px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          Usar suma de ítems como total
        </button>
      )}

      {isSupermarketExpense && itemsCount === 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-surface-soft p-4 text-sm text-muted-foreground">
          Para compras de súper conviene cargar productos: después esto alimenta las categorías mensuales.
        </div>
      )}

      {hasBlockingDifference && (
        <div className="mt-4 flex gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>La diferencia supera $0.05. Ajustá el total declarado o los ítems.</span>
        </div>
      )}

      {error && (
        <div className="mt-4 flex gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-4 flex gap-3 rounded-2xl border border-success/40 bg-success/10 p-4 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <LiquidGlass variant="button" intensity="medium" disabled={!canSubmit} className="mt-5 block">
        <button type="submit" disabled={!canSubmit} onClick={onSubmit}
          className="flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-foreground disabled:cursor-not-allowed focus-visible:outline-none">
          <Save className="h-4 w-4 text-primary" />
          {isSubmitting ? 'Guardando…' : 'Guardar gasto'}
        </button>
      </LiquidGlass>
    </div>
  )
}

function SummaryRow({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-soft px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold ${danger ? 'text-danger' : 'text-foreground'}`}>{value}</span>
    </div>
  )
}
