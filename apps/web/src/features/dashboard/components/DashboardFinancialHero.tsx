'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useDashboardData } from '../DashboardData'
import { computeSummary } from '@/features/personal-finance/utils'
import DashboardDataState from './DashboardDataState'

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat('es-UY', { style: 'currency', currency }).format(amount)

/**
 * Resumen financiero mensual en el Hero del Dashboard.
 * Jerarquía visual de lujo, minimalista, con contención total en mobile.
 */
export default function DashboardFinancialHero() {
  const { expenses, loading, error } = useDashboardData()
  const summary = computeSummary(expenses)
  const [activeCurrency, setActiveCurrency] = useState<'UYU' | 'USD'>('UYU')

  return (
    <div className="pt-0 text-[#F5F2EE] w-full min-w-0">
      {/* Header con título y link a saldo de cuentas */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <h2 className="font-ui text-xs font-normal text-[#F5F2EE] truncate min-w-0">
          Tus movimientos del mes
        </h2>
        <Link
          href="/balance"
          className="inline-flex py-0.5 items-center gap-1.5 text-xs font-normal text-[#C0D5D6] hover:text-[#F5F2EE] transition-colors shrink-0 underline-offset-4 hover:underline"
        >
          <span>Ver cuentas</span>
          <ArrowRight size={14} className="shrink-0" />
        </Link>
      </div>

      {loading || error ? (
        <DashboardDataState inverted />
      ) : (
        <div className="mt-1.5 sm:mt-2 flex flex-col gap-2.5 sm:gap-3 min-w-0">
          {/* Selector de moneda en mobile / vista combinada en desktop */}
          <div className="flex sm:hidden items-center justify-between gap-2 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A58D66]">
              Moneda
            </span>
            <div className="flex gap-1 rounded-xl bg-white/[0.06] p-0.5 border border-white/10" role="group" aria-label="Seleccionar moneda">
              {(['UYU', 'USD'] as const).map((curr) => (
                <button
                  key={curr}
                  type="button"
                  aria-pressed={activeCurrency === curr}
                  onClick={() => setActiveCurrency(curr)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                    activeCurrency === curr
                      ? 'bg-[#F5F2EE] text-[#083A4F] shadow-xs'
                      : 'text-[#C0D5D6] hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Tarjetas de movimientos: 1 activa en mobile, ambas en sm+ */}
          <div className="grid gap-3 sm:grid-cols-2 min-w-0">
            {(['UYU', 'USD'] as const).map((currency) => {
              const isHiddenOnMobile = activeCurrency !== currency

              return (
                <section
                  key={currency}
                  aria-label={`Movimientos en ${currency}`}
                  className={`min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-md transition-all ${
                    isHiddenOnMobile ? 'hidden sm:flex sm:flex-col' : 'flex flex-col'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-xs font-medium text-[#C0D5D6] truncate">
                      Egresos totales · {currency}
                    </span>
                    <span className="hidden sm:inline-block rounded-md bg-white/[0.08] px-2 py-0.5 text-[10px] font-bold tracking-wide text-[#C0D5D6]">
                      {currency}
                    </span>
                  </div>

                  <p
                    className="financial-number mt-1.5 text-2xl sm:text-3xl text-[#F5F2EE] truncate min-w-0"
                    title={money(summary.expenseByCurrency[currency], currency)}
                  >
                    {money(summary.expenseByCurrency[currency], currency)}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/[0.08] pt-2.5 min-w-0">
                    <div className="min-w-0">
                      <span className="flex items-center gap-1 text-[11px] text-[#C0D5D6] truncate">
                        <ArrowDownRight size={12} className="shrink-0 text-success" />
                        Ingresos
                      </span>
                      <p
                        className="mt-0.5 text-xs sm:text-sm font-semibold text-[#F5F2EE] tabular-nums truncate"
                        title={money(summary.incomeByCurrency[currency], currency)}
                      >
                        {money(summary.incomeByCurrency[currency], currency)}
                      </p>
                    </div>

                    <div className="min-w-0">
                      <span className="flex items-center gap-1 text-[11px] text-[#C0D5D6] truncate">
                        <ArrowUpRight size={12} className="shrink-0 text-[#A58D66]" />
                        Diferencia
                      </span>
                      <p
                        className="mt-0.5 text-xs sm:text-sm font-semibold text-[#F5F2EE] tabular-nums truncate"
                        title={money(summary.netByCurrency[currency], currency)}
                      >
                        {money(summary.netByCurrency[currency], currency)}
                      </p>
                    </div>
                  </div>
                </section>
              )
            })}
          </div>

          <p className="border-t border-white/10 pt-2 text-[11px] text-[#C0D5D6]/80 truncate min-w-0">
            {expenses.length} movimientos registrados este mes · Monedas sin convertir
          </p>
        </div>
      )}
    </div>
  )
}
