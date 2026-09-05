'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ArrowDown,
  ArrowUp,

  ScanLine,
} from 'lucide-react'
import { useProfile } from '@/features/auth/ProfileProvider'
import { usePersonalFinance, useFinanceAccounts, useCreateExpense } from './hooks'
import { currentMonthKey } from './constants'
import { computeSummary } from './utils'
import FinanzasHero from './FinanzasHero'
import FinanceMonthlyDetails from './FinanceMonthlyDetails'
import FinanzasAccountsCard from './FinanzasAccountsCard'
import ExpenseForm from './ExpenseForm'
import ReceiptPasteForm from './ReceiptPasteForm'
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
        <section className="flex items-center gap-2.5" aria-label="Acciones rápidas">
          {/* Ingreso */}
          <button
            type="button"
            onClick={() => setIsIncomeModalOpen(true)}
            className="neu-interactive flex flex-1 items-center justify-center gap-2 rounded-2xl border border-border/50 bg-surface py-3.5 px-3.5 text-sm font-semibold text-primary text-center"
          >
            <ArrowDown className="h-4 w-4 stroke-[2.5] text-primary" />
            <span>Ingreso</span>
          </button>

          {/* Egreso */}
          <button
            type="button"
            onClick={() => setView('new-expense')}
            className="neu-interactive flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 px-3.5 text-sm font-bold text-primary-foreground text-center"
          >
            <ArrowUp className="h-4 w-4 stroke-[2.5]" />
            <span>Egreso</span>
          </button>

          {/* Ticket Scan directo a cámara */}
          <Link
            href="/expenses/new?scan=camera"
            aria-label="Escanear ticket con cámara"
            title="Escanear ticket con cámara"
            className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-2xl border border-[#407E8C]/30 bg-[#407E8C]/10 text-[#407E8C] dark:text-[#C0D5D6] shadow-xs transition-all hover:bg-[#407E8C]/20 hover:border-[#407E8C]/50 active:scale-95"
          >
            <ScanLine className="h-5 w-5 stroke-[2.2]" />
          </Link>
        </section>

        <FinanceMonthlyDetails expenses={expenses} loading={loading} error={error} onRetry={refetch} />
        <FinanzasAccountsCard accounts={accounts} loading={loadingAccounts} />
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


