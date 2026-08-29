'use client'

import React from 'react'
import { Wallet, CreditCard, Building2, Banknote } from 'lucide-react'
import { formatCurrency } from './constants'
import type { FinanceAccount } from './types'

interface FinanzasAccountsCardProps {
  accounts: FinanceAccount[]
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

export default function FinanzasAccountsCard({ accounts, loading }: FinanzasAccountsCardProps) {
  if (loading) {
    return (
      <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs animate-pulse">
        <div className="h-4 w-28 rounded-md bg-surface-soft mb-4" />
        <div className="space-y-3">
          <div className="h-10 w-full rounded-2xl bg-surface-soft" />
          <div className="h-10 w-full rounded-2xl bg-surface-soft" />
        </div>
      </div>
    )
  }

  if (accounts.length === 0) {
    return null
  }

  // Total disponible (cuentas de débito y efectivo)
  const totalLiquid = accounts
    .filter((a) => a.type !== 'CREDIT')
    .reduce((sum, a) => sum + (a.balance || 0), 0)

  return (
    <div className="rounded-3xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 text-primary bg-transparent">
            <Wallet className="h-4 w-4 stroke-[2]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Tus cuentas</h2>
            <p className="text-[11px] text-muted-foreground">Disponibilidad y medios de pago</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-[#2E7D6A] dark:text-[#4BE3B5] tabular-nums">
            {formatCurrency(totalLiquid)}
          </span>
          <p className="text-[10px] text-muted-foreground">Líquido total</p>
        </div>
      </div>

      {/* Lista de cuentas */}
      <div className="mt-3.5 divide-y divide-border/40">
        {accounts.map((acc) => {
          const isCredit = acc.type === 'CREDIT'
          const borderClass = isCredit
            ? 'border-[#A58D66]/40 text-[#A58D66]'
            : acc.type === 'BANK'
            ? 'border-primary/30 text-primary'
            : 'border-cat-super/40 text-cat-super'

          return (
            <div key={acc.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${borderClass} bg-transparent`}>
                  {getAccountIcon(acc.type)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {acc.name}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {getAccountBadge(acc.type)} • {acc.currency}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`text-xs font-bold tabular-nums ${isCredit ? 'text-[#A58D66]' : 'text-foreground'}`}>
                  {formatCurrency(acc.balance)}
                </span>
                {isCredit && acc.creditLimit && (
                  <p className="text-[10px] text-muted-foreground tabular-nums">
                    Límite: {formatCurrency(acc.creditLimit)}
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
