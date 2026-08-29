'use client'

import React from 'react'
import { Wallet, CreditCard, Building2, Banknote } from 'lucide-react'
import { formatCurrency } from './constants'
import type { FinanceAccount } from './types'

interface FinanzasAccountsCardProps {
  accounts: FinanceAccount[]
  savings?: number
  loading?: boolean
}

function getAccountIcon(type: FinanceAccount['type']) {
  switch (type) {
    case 'BANK':
      return <Building2 className="h-4 w-4 stroke-[2]" />
    case 'CREDIT':
      return <CreditCard className="h-4 w-4 stroke-[2]" />
    case 'CASH':
      return <Banknote className="h-4 w-4 stroke-[2]" />
    default:
      return <Wallet className="h-4 w-4 stroke-[2]" />
  }
}

function getAccountBadge(type: FinanceAccount['type']) {
  switch (type) {
    case 'BANK':
      return 'Banco'
    case 'CREDIT':
      return 'Crédito'
    case 'CASH':
      return 'Efectivo'
    default:
      return 'Cuenta'
  }
}

export default function FinanzasAccountsCard({ accounts, savings = 0, loading }: FinanzasAccountsCardProps) {
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#062433] via-[#083A4F] to-[#072F40] border border-white/[0.1] p-5 sm:p-6 shadow-[0_12px_30px_rgba(8,58,79,0.15)] animate-pulse">
        <div className="h-4 w-28 rounded-md bg-white/[0.1] mb-4" />
        <div className="space-y-3">
          <div className="h-10 w-full rounded-2xl bg-white/[0.05]" />
          <div className="h-10 w-full rounded-2xl bg-white/[0.05]" />
        </div>
      </div>
    )
  }

  if (accounts.length === 0) {
    return null
  }

  // Total disponible por moneda (cuentas de débito y efectivo)
  const liquidUYU = accounts
    .filter((a) => a.type !== 'CREDIT' && a.currency === 'UYU')
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0)

  const liquidUSD = accounts
    .filter((a) => a.type !== 'CREDIT' && a.currency === 'USD')
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0)

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#062433] via-[#083A4F] to-[#072F40] dark:from-[#04141D] dark:via-[#061D27] dark:to-[#051720] border border-white/[0.1] p-5 sm:p-6 shadow-[0_12px_30px_rgba(8,58,79,0.15)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
      {/* Luces de ambiente sutiles */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[#407E8C]/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[#A58D66]/15 blur-2xl" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-3.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-[#F5F2EE] bg-transparent">
            <Wallet className="h-4 w-4 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#F5F2EE]">Tus cuentas</h2>
            <p className="text-[11px] text-[#C0D5D6]/70">Disponibilidad real por divisa</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-baseline justify-end gap-1.5">
            <span className="text-xs font-bold text-[#4BE3B5] tabular-nums">
              {formatCurrency(liquidUYU)}
            </span>
            {liquidUSD > 0 && (
              <span className="text-xs font-bold text-[#C0D5D6] tabular-nums">
                <span className="text-[10px] text-white/40 mr-0.5">|</span>
                US${liquidUSD.toLocaleString('es-UY', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </span>
            )}
          </div>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <span className="text-[10px] text-[#C0D5D6]/70">Líquido disponible</span>
            {savings !== 0 && (
              <span className="rounded-full bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.2 text-[9px] font-semibold text-[#A58D66]">
                Ahorro: {formatCurrency(savings)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Lista de cuentas */}
      <div className="relative z-10 mt-3.5 divide-y divide-white/[0.06]">
        {accounts.map((acc) => {
          const isCredit = acc.type === 'CREDIT'
          const isUSD = acc.currency === 'USD'
          const borderClass = isCredit
            ? 'border-[#A58D66]/50 text-[#A58D66]'
            : acc.type === 'BANK'
            ? 'border-[#407E8C]/50 text-[#C0D5D6]'
            : 'border-[#4BE3B5]/40 text-[#4BE3B5]'

          const formattedBalance = isUSD
            ? `US$ ${Number(acc.balance).toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : formatCurrency(acc.balance)

          return (
            <div key={acc.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${borderClass} bg-transparent`}>
                  {getAccountIcon(acc.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#F5F2EE] truncate">
                    {acc.name}
                  </p>
                  <span className="text-[10px] text-[#C0D5D6]/60">
                    {getAccountBadge(acc.type)} • {acc.currency}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-xs font-bold tabular-nums ${isCredit ? 'text-[#A58D66]' : 'text-[#F5F2EE]'}`}>
                  {formattedBalance}
                </span>
                {isCredit && acc.creditLimit && (
                  <p className="text-[10px] text-[#C0D5D6]/50 tabular-nums">
                    Límite: {isUSD ? `US$ ${Number(acc.creditLimit).toLocaleString('es-UY')}` : formatCurrency(acc.creditLimit)}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
