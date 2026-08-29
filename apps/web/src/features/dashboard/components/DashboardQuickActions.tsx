'use client'

import React from 'react'
import Link from 'next/link'
import { Plus, ScanLine } from 'lucide-react'

/**
 * Fila de acciones rápidas para pantallas móviles en el contenido claro del Dashboard.
 */
export default function DashboardQuickActions() {
  return (
    <section className="grid grid-cols-2 gap-3 sm:hidden">
      <Link
        href="/expenses/new"
        className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 px-4 text-sm font-bold text-primary-foreground shadow-xs transition-all active:scale-95 text-center hover:bg-primary-hover"
      >
        <Plus className="h-4 w-4 stroke-[2.5]" />
        Agregar gasto
      </Link>
      <Link
        href="/expenses/new"
        className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 px-4 text-sm font-semibold text-foreground shadow-xs transition-all hover:bg-surface-soft active:scale-95 text-center"
      >
        <ScanLine className="h-4 w-4 text-muted-foreground" />
        Escanear ticket
      </Link>
    </section>
  )
}
