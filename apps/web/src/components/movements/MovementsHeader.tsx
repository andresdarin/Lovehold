'use client'

import Link from 'next/link'
import { Plus, Wallet } from 'lucide-react'
import LiquidGlass from '@/components/ui/LiquidGlass'

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
      <LiquidGlass variant="button" intensity="medium" className="inline-flex self-start sm:self-auto">
        <Link href="/expenses/new" className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-foreground">
          <Plus className="h-4 w-4 text-primary" />
          Nuevo gasto
        </Link>
      </LiquidGlass>
    </header>
  )
}
