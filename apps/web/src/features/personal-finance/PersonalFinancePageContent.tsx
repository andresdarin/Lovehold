'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { usePersonalFinance, useCreateExpense } from './hooks'
import { monthLabel, currentMonthKey } from './constants'
import { computeSummary } from './utils'
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
      {/* 1. Header */}
      <header className="space-y-3">
        <div>
          <h1 className="text-[15px] font-medium text-primary uppercase tracking-wide">Finanzas Personales</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Controlá tus finanzas personales y llevá un registro detallado</p>
        </div>

        {/* Navegación del mes */}
        <div className="flex items-center justify-between border-t border-b border-border/40 py-2">
          <button 
            onClick={() => shiftMonth(-1)} 
            className="text-muted-foreground hover:text-foreground p-1 transition-colors focus:outline-none"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-foreground">{monthLabel(monthKey)}</span>
          <button 
            onClick={() => shiftMonth(1)} 
            className="text-muted-foreground hover:text-foreground p-1 transition-colors focus:outline-none"
            aria-label="Siguiente mes"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dos botones */}
        <div className="flex gap-2">
          <button 
            onClick={() => setView('paste-ticket')} 
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg border border-border bg-surface text-foreground hover:bg-surface-soft transition-colors focus:outline-none"
          >
            Pagar ticket
          </button>
          <button 
            onClick={() => setView('new-expense')} 
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors focus:outline-none"
          >
            <Plus className="h-3.5 w-3.5" /> Nuevo gasto
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</p>
      ) : (
        <div className="space-y-6">
          {/* 2. Tarjetas de resumen */}
          <MonthlySummaryCards summary={summary} />

          {/* 3. Gastos recientes */}
          <section className="space-y-3">
            <h3 className="text-[15px] font-medium text-primary uppercase tracking-wide">Gastos recientes</h3>
            <RecentExpensesList expenses={expenses} />
          </section>

          {/* 4. Categorías del mes */}
          <section className="space-y-3">
            <h3 className="text-[15px] font-medium text-primary uppercase tracking-wide">Categorías del mes</h3>
            <CategoryBreakdown byCategory={summary.byCategory} total={summary.total} />
          </section>

          {/* 5. Productos más comprados */}
          {allItems.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-[15px] font-medium text-primary uppercase tracking-wide">Productos más comprados</h3>
              <ProductMonthlyRanking items={allItems} />
            </section>
          )}
        </div>
      )}
    </div>
  )
}
