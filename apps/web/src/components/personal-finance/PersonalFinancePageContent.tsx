'use client'

import React, { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus, ClipboardPaste } from 'lucide-react'
import { usePersonalFinance, useCreateExpense } from './hooks'
import { monthLabel, currentMonthKey } from './constants'
import { computeSummary, computeProductRanking } from './utils'
import MonthlySummaryCards from './MonthlySummaryCards'
import ExpenseForm from './ExpenseForm'
import ReceiptPasteForm from './ReceiptPasteForm'
import RecentExpensesList from './RecentExpensesList'
import CategoryBreakdown from './CategoryBreakdown'
import ProductMonthlyRanking from './ProductMonthlyRanking'

type ViewMode = 'overview' | 'new-expense' | 'paste-ticket'

export default function PersonalFinancePageContent() {
  const [monthKey, setMonthKey] = useState(currentMonthKey)
  const [view, setView] = useState<ViewMode>('overview')
  const { expenses, loading, error, refetch } = usePersonalFinance(monthKey)
  const { create, submitting } = useCreateExpense()

  const allItems = useMemo(() => expenses.flatMap((e) => e.items ?? []), [expenses])
  const summary = useMemo(() => computeSummary(expenses), [expenses])
  const ranking = useMemo(() => computeProductRanking(allItems), [allItems])

  function shiftMonth(delta: number) {
    const parts = monthKey.split('-')
    const y = parseInt(parts[0] ?? '0')
    const m = parseInt(parts[1] ?? '1')
    const d = new Date(y, m - 1 + delta, 1)
    setMonthKey(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  async function handleCreate(data: Parameters<typeof ExpenseForm.prototype.props.onSubmit>[0]) {
    await create(data)
    refetch()
    setView('overview')
  }

  if (view === 'new-expense') {
    return (
      <div className="space-y-5">
        <button onClick={() => setView('overview')} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 rounded-lg px-2 py-1">
          <ChevronLeft className="h-4 w-4" /> Volver
        </button>
        <h2 className="text-lg font-bold text-foreground">Nuevo gasto</h2>
        <ExpenseForm onSubmit={handleCreate} onCancel={() => setView('overview')} submitting={submitting} />
      </div>
    )
  }

  if (view === 'paste-ticket') {
    return (
      <div className="space-y-5">
        <button onClick={() => setView('overview')} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 rounded-lg px-2 py-1">
          <ChevronLeft className="h-4 w-4" /> Volver
        </button>
        <h2 className="text-lg font-bold text-foreground">Pegar ticket</h2>
        <ReceiptPasteForm onSubmit={handleCreate} onCancel={() => setView('overview')} submitting={submitting} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => shiftMonth(-1)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-primary/45">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="text-lg font-bold text-foreground">{monthLabel(monthKey)}</h2>
          <button onClick={() => shiftMonth(1)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-primary/45">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('paste-ticket')} className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-surface-soft focus:outline-none focus:ring-2 focus:ring-primary/45">
            <ClipboardPaste className="h-4 w-4" /> Pegar ticket
          </button>
          <button onClick={() => setView('new-expense')} className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/45">
            <Plus className="h-4 w-4" /> Nuevo gasto
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</p>
      ) : (
        <>
          <MonthlySummaryCards summary={summary} />

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-foreground">Gastos recientes</h3>
              <RecentExpensesList expenses={expenses} />
            </section>
            <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-foreground">Categorías del mes</h3>
              <CategoryBreakdown byCategory={summary.byCategory} total={summary.total} />
            </section>
          </div>

          {ranking.length > 0 && (
            <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-bold text-foreground">Productos más comprados</h3>
              <p className="mb-3 text-xs text-muted-foreground">
                Promedio mensual general: ${(summary.total / Math.max(summary.count, 1)).toFixed(2)} por gasto
              </p>
              <ProductMonthlyRanking ranking={ranking} />
            </section>
          )}
        </>
      )}
    </div>
  )
}
