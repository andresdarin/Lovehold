'use client'
import { useState } from 'react'
import { computeSummary } from './utils'
import type { PersonalExpense } from './types'
import MonthlySummaryCards from './MonthlySummaryCards'
import RecentExpensesList from './RecentExpensesList'
import CategoryBreakdown from './CategoryBreakdown'
import ProductMonthlyRanking from './ProductMonthlyRanking'
import FeatherLoading from '@/components/ui/FeatherLoading'
export default function FinanceMonthlyDetails({ expenses, loading, error, onRetry }: { expenses: PersonalExpense[]; loading: boolean; error: string | null; onRetry: () => void }) {
  const [currency, setCurrency] = useState<'UYU' | 'USD'>('UYU')
  const selected = expenses.filter(row => (row.currency || 'UYU') === currency)
  const summary = computeSummary(selected)
  const items = selected.filter(row => !row.movementType || row.movementType === 'EXPENSE').flatMap(row => row.items || [])
  if (loading) {
    return (
      <div className="py-6">
        <FeatherLoading
          variant="card"
          message="Cargando movimientos del mes…"
        />
      </div>
    )
  }
  if (error) return <div role="alert" className="rounded-xl border border-danger/30 bg-surface p-4"><p>No pudimos cargar los movimientos de este mes.</p><button onClick={onRetry} className="mt-2 min-h-11 text-primary underline">Volver a cargar</button></div>
  return <div className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Elegí una moneda para ver su desglose, sin conversiones.</p><div role="group" aria-label="Moneda del resumen" className="flex gap-1">
      {(['UYU', 'USD'] as const).map(value => <button key={value} aria-pressed={currency === value} onClick={() => setCurrency(value)} className={`min-h-11 rounded-xl px-4 text-sm font-semibold ${currency === value ? 'bg-primary text-primary-foreground' : 'border border-border bg-surface'}`}>{value}</button>)}
    </div></div>
    <MonthlySummaryCards summary={summary} currency={currency} />
    <div className="grid gap-5 md:grid-cols-2">
      <section className="rounded-2xl border border-border bg-surface p-5"><h2 className="mb-4 text-base font-semibold">Movimientos · {currency}</h2><RecentExpensesList expenses={selected} /></section>
      <section className="rounded-2xl border border-border bg-surface p-5"><h2 className="mb-4 text-base font-semibold">Categorías · {currency}</h2><CategoryBreakdown byCategory={summary.byCategory} total={summary.total} currency={currency} /></section>
    </div>
    {items.length > 0 && <section className="rounded-2xl border border-border bg-surface p-5"><h2 className="mb-4 text-base font-semibold">Productos más comprados · {currency}</h2><ProductMonthlyRanking items={items} currency={currency} /></section>}
  </div>
}

