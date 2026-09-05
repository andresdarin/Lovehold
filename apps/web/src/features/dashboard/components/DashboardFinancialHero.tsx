'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useDashboardData } from '../DashboardData'
import { computeSummary } from '@/features/personal-finance/utils'
import DashboardDataState from './DashboardDataState'
const money = (amount: number, currency: string) => new Intl.NumberFormat('es-UY', { style: 'currency', currency }).format(amount)
export default function DashboardFinancialHero() {
  const { expenses, loading, error } = useDashboardData()
  const summary = computeSummary(expenses)
  return <div className="pt-2 text-[#F5F2EE]">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-base font-medium text-[#C0D5D6]">Tus movimientos personales este mes</h2>
      <Link href="/balance" className="inline-flex min-h-11 items-center gap-2 text-sm underline-offset-4 hover:underline">Ver saldo de cuentas <ArrowRight size={16} /></Link>
    </div>
    {loading || error ? <DashboardDataState /> : <>
      <div className="grid gap-5 py-5 sm:grid-cols-2">
        {(['UYU', 'USD'] as const).map(currency => <section key={currency} aria-label={`Movimientos en ${currency}`}>
          <p className="text-sm text-[#C0D5D6]">Egresos · {currency}</p>
          <p className="mt-1 text-3xl sm:text-4xl font-bold tabular-nums break-words">{money(summary.expenseByCurrency[currency], currency)}</p>
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div><dt className="text-[#C0D5D6]">Ingresos</dt><dd className="mt-1 tabular-nums">{money(summary.incomeByCurrency[currency], currency)}</dd></div>
            <div><dt className="text-[#C0D5D6]">Diferencia del mes</dt><dd className="mt-1 tabular-nums">{money(summary.netByCurrency[currency], currency)}</dd></div>
          </dl>
        </section>)}
      </div>
      <p className="border-t border-white/20 pt-3 text-sm text-[#C0D5D6]">{expenses.length} movimientos registrados. La diferencia del mes no es tu saldo disponible. Monedas sin convertir.</p>
    </>}
  </div>
}

