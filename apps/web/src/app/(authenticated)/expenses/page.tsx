'use client'

import React from 'react'
import { Wallet, Search } from 'lucide-react'

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Movimientos</h1>
          <p className="text-sm text-muted-foreground">Listado histórico de gastos compartidos</p>
        </div>
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
