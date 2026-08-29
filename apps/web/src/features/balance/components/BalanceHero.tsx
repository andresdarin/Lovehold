'use client'

import { ArrowDownLeft, ArrowUpRight, CircleDollarSign, type LucideIcon } from 'lucide-react'
import type { BalanceProps } from '../types'
import { accountTotals, money, totalsFromSnapshot } from '../utils'

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) {
  return <div className="rounded-2xl border border-white/[0.05] bg-white/[0.03] p-2.5 sm:p-3">
    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#C0D5D6]/70"><Icon className="h-3 w-3" />{label}</div>
    <p className="mt-1.5 truncate text-sm font-bold tabular-nums text-[#F5F2EE]">{value}</p>
  </div>
}

export default function BalanceHero({ accounts, snapshot }: BalanceProps) {
  const available = totalsFromSnapshot(snapshot, 'spendableByCurrency')
  const fallback = accountTotals(accounts)
  if (!snapshot) Object.assign(available, fallback)
  const debt = totalsFromSnapshot(snapshot, 'creditDebtByCurrency')
  const estimated = snapshot?.balances?.spendableInBase ?? snapshot?.spendableInBase
  const estimatedAmount = estimated?.amount == null ? null : Number(estimated.amount)
  const availableLabel = available.UYU || available.USD ? `${money(available.UYU, 'UYU')}${available.USD ? ` · ${money(available.USD, 'USD')}` : ''}` : '—'
  const debtLabel = debt.UYU || debt.USD ? `${money(debt.UYU, 'UYU')}${debt.USD ? ` · ${money(debt.USD, 'USD')}` : ''}` : '—'

  return <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#062433] via-[#083A4F] to-[#072F40] dark:from-[#04141D] dark:via-[#061D27] dark:to-[#051720] pt-[calc(0.5rem+env(safe-area-inset-top))] pb-7 sm:pb-9 px-4 sm:px-6 md:px-8 rounded-b-[2rem] sm:rounded-b-[2.5rem] border-b border-black/10 dark:border-white/[0.06] shadow-[0_12px_30px_rgba(8,58,79,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
    <div className="pointer-events-none absolute -top-24 left-1/4 h-72 w-72 rounded-full bg-[#407E8C]/15 blur-3xl" />
    <div className="pointer-events-none absolute top-1/2 -right-20 h-64 w-64 rounded-full bg-[#A58D66]/10 blur-3xl" />
    <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4 sm:gap-5">
      <div className="flex items-center gap-2.5 pt-1"><CircleDollarSign className="h-5 w-5 text-[#A58D66]" /><span className="text-[11px] font-bold uppercase tracking-widest text-[#A58D66] dark:text-[#BCA47B]">Balance / Tu posición actual</span></div>
      <div><p className="text-[11px] font-bold uppercase tracking-wider text-[#C0D5D6]/70">{estimatedAmount != null ? 'Patrimonio estimado' : 'Patrimonio disponible'}</p><div className="mt-1 flex flex-wrap items-baseline gap-x-2"><strong className="text-3xl font-extrabold tracking-tight text-[#F5F2EE] sm:text-5xl tabular-nums">{estimatedAmount != null ? money(estimatedAmount, (estimated?.currency === 'USD' ? 'USD' : 'UYU')) : available.UYU ? money(available.UYU, 'UYU') : money(available.USD, 'USD')}</strong>{estimatedAmount == null && available.USD > 0 && available.UYU > 0 && <span className="text-sm font-bold text-[#C0D5D6] tabular-nums">· {money(available.USD, 'USD')}</span>}</div>{estimatedAmount != null && <p className="mt-1 text-[11px] text-[#C0D5D6]/70">Equivalente estimado en UYU · saldos originales abajo</p>}</div>
      <div className="grid grid-cols-3 gap-2 border-t border-white/[0.08] pt-3.5 sm:gap-3"><Metric label="Disponible" value={availableLabel} icon={ArrowDownLeft} /><Metric label="Por pagar" value={debtLabel} icon={ArrowUpRight} /><Metric label="A favor" value="—" icon={CircleDollarSign} /></div>
    </div>
  </section>
}
