'use client'
import Link from 'next/link'
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Plus } from 'lucide-react'
import { useDashboardData } from '../DashboardData'
import DashboardDataState from './DashboardDataState'
export default function DashboardRecentMovements() {
  const { expenses, loading, error } = useDashboardData()
  const recent = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)
  return <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-base font-semibold">Últimos movimientos</h2>
      <Link href="/finanzas" className="inline-flex min-h-11 items-center text-sm text-primary hover:underline">Ver mes completo</Link>
    </div>
    <p className="text-sm text-muted-foreground">Movimientos personales del mes actual</p>
    {loading || error ? <DashboardDataState /> : recent.length ? <ul className="mt-3 divide-y divide-border">
      {recent.map(row => {
        const income = row.movementType === 'INCOME'
        const transfer = row.movementType === 'TRANSFER'
        const Icon = transfer ? ArrowLeftRight : income ? ArrowDownLeft : ArrowUpRight
        return <li key={row.id} className="flex items-center gap-3 py-3">
          <Icon aria-hidden size={18} className={income ? 'shrink-0 text-success' : 'shrink-0 text-primary'} />
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{row.title}</p><p className="text-xs text-muted-foreground">{transfer ? 'Transferencia' : income ? 'Ingreso' : 'Egreso'} · {new Date(row.date).toLocaleDateString('es-UY', { timeZone: 'UTC', day: 'numeric', month: 'short' })}</p></div>
          <span className="text-sm font-semibold tabular-nums">{new Intl.NumberFormat('es-UY', { style: 'currency', currency: row.currency || 'UYU' }).format(row.amount)}</span>
        </li>
      })}
    </ul> : <div className="py-8 text-sm"><p className="font-medium">Tu mes empieza acá</p><p className="mt-1 text-muted-foreground">Registrá un ingreso o gasto para entender cómo cambia tu dinero.</p></div>}
    <Link href="/expenses/new" className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary-hover"><Plus size={16} /> Registrar movimiento</Link>
  </section>
}

