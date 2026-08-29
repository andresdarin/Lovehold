'use client'

import Link from 'next/link'
import { Plus, Wallet } from 'lucide-react'

export default function MovementsHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Movimientos</h1>
          <p className="text-sm text-muted-foreground">Historial de gastos personales y del hogar</p>
        </div>
      </div>
      <Link
        href="/expenses/new"
        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary-hover active:scale-95 self-start sm:self-auto"
      >
        <Plus className="h-4 w-4" />
        Nuevo gasto
      </Link>
    </header>
  )
}
