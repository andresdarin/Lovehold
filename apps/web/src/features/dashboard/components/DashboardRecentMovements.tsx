'use client'

import React from 'react'
import Link from 'next/link'
import { Receipt, Plus } from 'lucide-react'

/**
 * Últimos movimientos del mes con empty state minimalista en la sección clara.
 */
export default function DashboardRecentMovements() {
  return (
    <div className="rounded-3xl border border-border bg-surface p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-border/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Receipt className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Últimos movimientos</h2>
              <p className="text-xs text-muted-foreground">Tus gastos y los compartidos en pareja</p>
            </div>
          </div>
          <Link
            href="/expenses"
            className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            Ver historial
          </Link>
        </div>

        {/* Empty state minimal */}
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-soft text-muted-foreground">
            <Receipt className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">Todavía no hay gastos este mes</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
            Registrá tu primera compra para ver el detalle y balance financiero.
          </p>
        </div>
      </div>

      <Link
        href="/expenses/new"
        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface-soft py-2.5 text-xs font-bold text-foreground hover:bg-surface-alt transition-colors"
      >
        <Plus className="h-3.5 w-3.5 text-primary" /> Registrar movimiento
      </Link>
    </div>
  )
}
