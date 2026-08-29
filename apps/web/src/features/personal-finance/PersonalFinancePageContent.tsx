'use client'

import { useState, useMemo } from 'react'
import {
  ChevronLeft,
  ArrowDown,
  ArrowUp,
  Receipt,
  ScanLine,
} from 'lucide-react'
import { useProfile } from '@/features/auth/ProfileProvider'
import { usePersonalFinance, useFinanceAccounts, useCreateExpense } from './hooks'
import { currentMonthKey } from './constants'
import { computeSummary } from './utils'
import FinanzasHero from './FinanzasHero'
import MonthlySummaryCards from './MonthlySummaryCards'
import FinanzasAccountsCard from './FinanzasAccountsCard'
import ExpenseForm from './ExpenseForm'
import ReceiptPasteForm from './ReceiptPasteForm'
import RecentExpensesList from './RecentExpensesList'
import CategoryBreakdown from './CategoryBreakdown'
import ProductMonthlyRanking from './ProductMonthlyRanking'
import IncomeFormModal from './IncomeFormModal'
import TransferFormModal from './TransferFormModal'

type ViewMode = 'overview' | 'new-expense' | 'paste-ticket'

export default function PersonalFinancePageContent() {
  const { profile } = useProfile()
  const [monthKey, setMonthKey] = useState(currentMonthKey)
  const [view, setView] = useState<ViewMode>('overview')
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)

  const { expenses, loading, error, refetch } = usePersonalFinance(monthKey)
  const { accounts, loading: loadingAccounts, refetch: refetchAccounts } = useFinanceAccounts()
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
    refetchAccounts()
    setView('overview')
  }

  if (view === 'new-expense') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <button
          onClick={() => setView('overview')}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground focus:outline-none rounded-lg px-2 py-1"
        >
          <ChevronLeft className="h-4 w-4" /> Volver
        </button>
        <h2 className="text-lg font-bold text-foreground">Nuevo egreso</h2>
        <ExpenseForm onSubmit={handleCreate} onCancel={() => setView('overview')} submitting={submitting} />
      </div>
    )
  }

  if (view === 'paste-ticket') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <button
          onClick={() => setView('overview')}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground focus:outline-none rounded-lg px-2 py-1"
        >
          <ChevronLeft className="h-4 w-4" /> Volver
        </button>
        <h2 className="text-lg font-bold text-foreground">Pegar ticket</h2>
        <ReceiptPasteForm onSubmit={handleCreate} onCancel={() => setView('overview')} submitting={submitting} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-12 sm:pb-6">
      {/* 1. Franja Superior / Hero Negativo Full-Bleed (Azul Navy como el Dashboard) */}
      <FinanzasHero
        profile={profile}
        monthKey={monthKey}
        onShiftMonth={shiftMonth}
        summary={summary}
      />

      {/* 2. Cuerpo Modular Claro (Sand / Surface) */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-8 flex flex-col gap-6">
        {/* Acciones Rápidas (3 Botones con el mismo criterio que el Dashboard) */}
        <section className="flex items-center gap-2.5 sm:hidden" aria-label="Acciones rápidas">
          {/* Ingreso */}
          <button
            type="button"
            onClick={() => setIsIncomeModalOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/80 bg-surface py-3.5 px-3.5 text-sm font-semibold text-primary shadow-xs transition-all hover:bg-surface-soft hover:border-primary/30 active:scale-95 text-center"
          >
            <ArrowDown className="h-4 w-4 stroke-[2.5] text-primary" />
            <span>Ingreso</span>
          </button>

          {/* Egreso */}
          <button
            type="button"
            onClick={() => setView('new-expense')}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 px-3.5 text-sm font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary-hover active:scale-95 text-center"
          >
            <ArrowUp className="h-4 w-4 stroke-[2.5]" />
            <span>Egreso</span>
          </button>

          {/* Ticket Scan */}
          <button
            type="button"
            onClick={() => setView('paste-ticket')}
            aria-label="Pegar o escanear ticket"
            title="Pegar o escanear ticket"
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-[#407E8C]/30 bg-[#407E8C]/10 text-[#407E8C] dark:text-[#C0D5D6] shadow-xs transition-all hover:bg-[#407E8C]/20 hover:border-[#407E8C]/50 active:scale-95"
          >
            <ScanLine className="h-5 w-5 stroke-[2.2]" />
          </button>
        </section>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <p className="rounded-xl border border-danger/30 bg-danger/5 p-4 text-sm text-danger">{error}</p>
        ) : (
          <div className="flex flex-col gap-6">
            {/* 3. Tarjeta de Resumen del mes */}
            <MonthlySummaryCards summary={summary} />

            {/* 4. Cuentas y Liquidez con estilo Navy y Ahorro */}
            {accounts.length > 0 && (
              <FinanzasAccountsCard
                accounts={accounts}
                savings={summary.netBalance}
                loading={loadingAccounts}
              />
            )}

            {/* 5. Categorías & Movimientos en Grid responsivo */}
            <section className="grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3.5 border-b border-border/50 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 text-primary bg-transparent">
                      <Receipt className="h-4 w-4 stroke-[2]" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground">Movimientos del mes</h2>
                      <p className="text-[11px] text-muted-foreground">Listado cronológico</p>
                    </div>
                  </div>
                </div>
                <RecentExpensesList expenses={expenses} />
              </div>

              <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3.5 border-b border-border/50 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cat-super/40 text-cat-super bg-transparent">
                      <Receipt className="h-4 w-4 stroke-[2]" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground">Distribución por categoría</h2>
                      <p className="text-[11px] text-muted-foreground">Desglose de egresos</p>
                    </div>
                  </div>
                </div>
                <CategoryBreakdown byCategory={summary.byCategory} total={summary.total} />
              </div>
            </section>

            {/* 6. Ranking de productos */}
            {allItems.length > 0 && (
              <section className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs">
                <div className="pb-3.5 border-b border-border/50 mb-3.5">
                  <h2 className="text-sm font-bold text-foreground">Productos más comprados</h2>
                  <p className="text-[11px] text-muted-foreground">Artículos recurrentes de tickets</p>
                </div>
                <ProductMonthlyRanking items={allItems} />
              </section>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      <IncomeFormModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        onSuccess={() => refetch()}
      />

      <TransferFormModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
