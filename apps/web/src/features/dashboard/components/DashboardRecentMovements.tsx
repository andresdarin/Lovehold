'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Plus } from 'lucide-react'
import { useDashboardData } from '../DashboardData'
import DashboardDataState from './DashboardDataState'

/**
 * Lista de movimientos recientes en el Dashboard.
 * Contención estricta en mobile con truncado elíptico en títulos largos y sin desbordes.
 */
export default function DashboardRecentMovements() {
  const { expenses, loading, error } = useDashboardData()
  const recent = [...expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  return (
    <section className="w-full min-w-0 overflow-hidden rounded-2xl border border-border bg-surface p-4 sm:p-6 shadow-xs">
      {/* Header con título y enlace a mes completo */}
      <div className="flex items-center justify-between gap-2 min-w-0">
        <h2 className="text-base font-semibold text-foreground truncate min-w-0">
          Últimos movimientos
        </h2>
        <Link
          href="/finanzas"
          className="inline-flex min-h-9 items-center text-xs sm:text-sm font-medium text-primary hover:underline shrink-0"
        >
          Ver mes completo
        </Link>
      </div>

      <p className="mt-1 truncate text-xs sm:text-sm text-muted-foreground min-w-0">
        Movimientos personales del mes actual
      </p>

      {loading || error ? (
        <DashboardDataState />
      ) : recent.length ? (
        <ul className="mt-3 divide-y divide-border min-w-0">
          {recent.map((row) => {
            const income = row.movementType === 'INCOME'
            const transfer = row.movementType === 'TRANSFER'
            const Icon = transfer ? ArrowLeftRight : income ? ArrowDownLeft : ArrowUpRight

            return (
              <li key={row.id} className="flex items-center gap-3 py-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-soft/60">
                  <Icon
                    aria-hidden
                    size={16}
                    className={income ? 'shrink-0 text-success' : 'shrink-0 text-primary'}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground" title={row.title}>
                    {row.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {transfer ? 'Transferencia' : income ? 'Ingreso' : 'Egreso'} ·{' '}
                    {new Date(row.date).toLocaleDateString('es-UY', {
                      timeZone: 'UTC',
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                  {new Intl.NumberFormat('es-UY', {
                    style: 'currency',
                    currency: row.currency || 'UYU',
                  }).format(row.amount)}
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="py-8 text-sm">
          <p className="font-medium text-foreground">Tu mes empieza acá</p>
          <p className="mt-1 text-muted-foreground">
            Registrá un ingreso o gasto para entender cómo cambia tu dinero.
          </p>
        </div>
      )}

      <Link
        href="/expenses/new"
        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary-hover active:scale-[0.99] transition-all"
      >
        <Plus size={16} className="shrink-0" />
        <span className="truncate">Registrar movimiento</span>
      </Link>
    </section>
  )
}
