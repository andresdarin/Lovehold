'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRightLeft, Banknote, Building2, CreditCard, Wallet } from 'lucide-react'
import CurrencyExchangeModal from '@/features/personal-finance/CurrencyExchangeModal'
import type { BalanceProps } from '../types'
import { accountType, money } from '../utils'

function AccountIcon({ type }: { type: 'CASH' | 'BANK' | 'CREDIT' }) {
  const Icon = type === 'BANK' ? Building2 : type === 'CREDIT' ? CreditCard : Banknote
  return <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/5 text-primary"><Icon className="h-4 w-4" /></span>
}

export default function BalanceAccountsSection({ accounts, loading }: BalanceProps) {
  const [exchangeOpen, setExchangeOpen] = useState(false)
  const visible = accounts.slice(0, 4)
  return <>
    <section className="rounded-3xl border border-border/80 bg-surface p-5 shadow-xs sm:p-6">
      <header className="mb-3.5 flex items-center justify-between border-b border-border/50 pb-3.5">
        <div className="flex items-center gap-2.5"><Wallet className="h-4 w-4 text-primary" /><div><h2 className="text-sm font-bold text-foreground">Tus cuentas</h2><p className="text-[11px] text-muted-foreground">Tu dinero, separado por moneda</p></div></div>
        <button type="button" onClick={() => setExchangeOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary-hover"><ArrowRightLeft className="h-3.5 w-3.5" />Cambiar moneda</button>
      </header>
      {loading ? <div className="space-y-3 animate-pulse"><div className="h-12 rounded-2xl bg-surface-soft" /><div className="h-12 rounded-2xl bg-surface-soft" /></div> : accounts.length === 0 ? <p className="py-4 text-sm text-muted-foreground">Todavía no tenés cuentas registradas.</p> : <div className="divide-y divide-border/40">{visible.map((account) => <div key={account.id} className="flex min-w-0 items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"><div className="flex min-w-0 items-center gap-3"><AccountIcon type={account.type} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-foreground">{account.name}</p><p className="text-[11px] text-muted-foreground">{accountType(account.type)} · {account.currency}</p></div></div><p className="shrink-0 text-sm font-bold tabular-nums text-foreground">{money(Number(account.balance) || 0, account.currency)}</p></div>)}</div>}
      {accounts.length > 4 && <Link href="/finanzas" className="mt-4 block text-center text-xs font-semibold text-primary hover:text-primary-hover">Ver todas las cuentas</Link>}
    </section>
    <CurrencyExchangeModal isOpen={exchangeOpen} onClose={() => setExchangeOpen(false)} />
  </>
}
