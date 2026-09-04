'use client'

import React from 'react'
import Link from 'next/link'
import { Receipt, Plus } from 'lucide-react'

/**
 * Últimos movimientos del mes con empty state minimalista en la sección clara.
 * Iconos con outline circular del mismo color sin rellenos pesados.
 */
export default function DashboardRecentMovements() {
  return (
    <div className="neu-raised rounded-3xl border border-border/50 bg-surface p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3.5 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 text-primary bg-transparent">
              <Receipt className="h-4 w-4 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Últimos movimientos</h2>
              <p className="text-[11px] text-muted-foreground">Tus gastos y los compartidos en pareja</p>
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
        <div className="flex flex-col items-center justify-center py-7 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground bg-transparent">
            <Receipt className="h-5 w-5 stroke-[1.8]" />
          </div>
          <p className="mt-3 text-sm font-semibold text-foreground">Todavía no hay gastos este mes</p>
          <p className="mt-1 text-xs text-muted-foreground max-w-[240px] leading-relaxed">
            Registrá tu primera compra para ver el detalle y balance financiero.
          </p>
        </div>
      </div>

      <Link
        href="/expenses/new"
        className="flex items-center justify-center gap-2 rounded-2xl border border-border/80 bg-surface-soft/60 py-2.5 text-xs font-bold text-foreground hover:bg-surface-soft hover:border-primary/30 transition-all active:scale-[0.98]"
      >
        <Plus className="h-3.5 w-3.5 stroke-[2.5] text-primary" />
        <span>Registrar movimiento</span>
      </Link>
    </div>
  )
}
