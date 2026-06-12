'use client'

import Link from 'next/link'
import React from 'react'
import { Plus, Search, Wallet } from 'lucide-react'
import LiquidGlass from '@/components/ui/LiquidGlass'

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Movimientos</h1>
            <p className="text-sm text-muted-foreground">Listado histórico de gastos compartidos</p>
          </div>
        </div>
        <LiquidGlass variant="button" intensity="medium" className="inline-flex self-start sm:self-auto">
          <Link href="/expenses/new" className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-foreground">
            <Plus className="h-4 w-4 text-primary" />
            Nuevo gasto
          </Link>
        </LiquidGlass>
      </header>

      <section className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-soft">
          <Search className="h-6 w-6 text-muted-foreground animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Próximamente</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Acá vas a poder ver el detalle, filtrar y buscar todos los gastos que ingresen.
          </p>
        </div>
      </section>
    </div>
  )
}
