'use client'
import { useState } from 'react'
import { useDashboardData } from '../DashboardData'
import { computeSummary } from '@/features/personal-finance/utils'
import { CATEGORY_LABELS } from '@/features/personal-finance/constants'
import DashboardDataState from './DashboardDataState'
export default function DashboardCategorySummary() {
  const { expenses, loading, error } = useDashboardData()
  const [currency, setCurrency] = useState<'UYU' | 'USD'>('UYU')
  const summary = computeSummary(expenses.filter(row => (row.currency || 'UYU') === currency))
  const categories = Object.entries(summary.byCategory).sort((a, b) => b[1] - a[1]).slice(0, 4)
  return <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-base font-semibold">Dónde se va tu dinero</h2>
      <div className="flex gap-1" role="group" aria-label="Moneda de categorías">
        {(['UYU', 'USD'] as const).map(value => <button key={value} aria-pressed={currency === value} onClick={() => setCurrency(value)} className={`min-h-11 rounded-lg px-3 text-sm font-semibold ${currency === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-soft'}`}>{value}</button>)}
      </div>
    </div>
    <p className="text-sm text-muted-foreground">Principales categorías · solo egresos · {currency}</p>
    {loading || error ? <DashboardDataState /> : categories.length ? <ul className="mt-5 space-y-5">
      {categories.map(([name, amount]) => <li key={name}>
        <div className="flex items-baseline justify-between gap-3 text-sm"><span className="capitalize">{CATEGORY_LABELS[name] || name.replaceAll('_', ' ')}</span><span className="font-semibold tabular-nums">{new Intl.NumberFormat('es-UY', { style: 'currency', currency }).format(amount)}</span></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-soft" aria-hidden><div className="h-full rounded-full bg-primary" style={{ width: `${summary.total ? amount / summary.total * 100 : 0}%` }} /></div>
      </li>)}
    </ul> : <div className="py-8 text-sm"><p className="font-medium">Sin egresos en {currency} este mes</p><p className="mt-1 text-muted-foreground">Las categorías aparecerán cuando registres un gasto en esta moneda.</p></div>}
  </section>
}

