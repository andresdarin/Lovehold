'use client'

import Link from 'next/link'
import { Plus, Wallet } from 'lucide-react'

export default function MovementsHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary bg-transparent">
          <Wallet className="h-4 w-4 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Movimientos</h1>
          <p className="text-xs text-muted-foreground">Historial de gastos personales y del hogar</p>
        </div>
      </div>
      <Link
        href="/expenses/new"
        className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary-hover active:scale-95 self-start sm:self-auto"
      >
        <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
        <span>Nuevo gasto</span>
      </Link>
    </header>
  )
}
