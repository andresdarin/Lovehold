'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRightLeft, Banknote, Building2, CreditCard, PiggyBank, Wallet } from 'lucide-react'
import CurrencyExchangeModal from '@/features/personal-finance/CurrencyExchangeModal'
import type { BalanceProps } from '../types'
import { accountType, money } from '../utils'

function AccountIcon({ type, name }: { type: 'CASH' | 'BANK' | 'CREDIT' | string; name?: string }) {
  const isSavings = type === 'SAVINGS' || (name && name.toLowerCase().includes('ahorro'))
  if (isSavings) {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#A58D66]/40 bg-transparent text-[#A58D66]">
        <PiggyBank className="h-4 w-4 stroke-[2]" />
      </span>
    )
  }
  if (type === 'BANK') {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-transparent text-primary">
        <Building2 className="h-4 w-4 stroke-[2]" />
      </span>
    )
  }
  if (type === 'CREDIT') {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#A58D66]/40 bg-transparent text-[#A58D66]">
        <CreditCard className="h-4 w-4 stroke-[2]" />
      </span>
    )
  }
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cat-super/40 bg-transparent text-cat-super">
      <Banknote className="h-4 w-4 stroke-[2]" />
    </span>
  )
}

export default function BalanceAccountsSection({ accounts, loading }: BalanceProps) {
  const [exchangeOpen, setExchangeOpen] = useState(false)
  const visible = accounts.slice(0, 6)

  return (
    <>
      <section className="rounded-3xl border border-border/80 bg-surface p-5 shadow-xs sm:p-6">
        <header className="mb-3.5 flex items-center justify-between border-b border-border/50 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 text-primary bg-transparent">
              <Wallet className="h-4 w-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Tus cuentas</h2>
              <p className="text-[11px] text-muted-foreground">Tu dinero, separado por moneda y propósito</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExchangeOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary-hover"
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
            Cambiar moneda
          </button>
        </header>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-12 rounded-2xl bg-surface-soft" />
            <div className="h-12 rounded-2xl bg-surface-soft" />
          </div>
        ) : accounts.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">Todavía no tenés cuentas registradas.</p>
        ) : (
          <div className="divide-y divide-border/40">
            {visible.map((account) => {
              const isSavings = account.name.toLowerCase().includes('ahorro')
              return (
                <div key={account.id} className="flex min-w-0 items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <AccountIcon type={account.type} name={account.name} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{account.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {isSavings ? 'Ahorro' : accountType(account.type)} · {account.currency}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-bold tabular-nums text-foreground">
                    {money(Number(account.balance) || 0, account.currency)}
                  </p>
                </div>
              )
            })}
          </div>
        )}

        {accounts.length > 6 && (
          <Link href="/finanzas" className="mt-4 block text-center text-xs font-semibold text-primary hover:text-primary-hover">
            Ver todas las cuentas
          </Link>
        )}
      </section>
      <CurrencyExchangeModal isOpen={exchangeOpen} onClose={() => setExchangeOpen(false)} />
    </>
  )
}
