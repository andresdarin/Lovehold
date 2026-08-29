'use client'

import React from 'react'
import { TrendingUp, Search } from 'lucide-react'

export default function BalancePage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 text-accent bg-transparent">
          <TrendingUp className="h-4 w-4 stroke-[2]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Balance</h1>
          <p className="text-xs text-muted-foreground">Estado de cuentas y quién le debe a quién</p>
        </div>
      </header>

      <section className="flex flex-col items-center gap-3 rounded-3xl border border-border/80 bg-surface p-10 text-center shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-muted-foreground bg-transparent">
          <Search className="h-5 w-5 stroke-[1.8]" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Próximamente</h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm leading-relaxed">
            Cálculo automático de balances en tiempo real para saber cómo liquidar cuentas de forma simple y transparente.
          </p>
        </div>
      </section>
    </div>
  )
}
