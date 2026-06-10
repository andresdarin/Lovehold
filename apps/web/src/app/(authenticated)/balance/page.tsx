'use client'

import React from 'react'
import { TrendingUp, Search } from 'lucide-react'

export default function BalancePage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10">
          <TrendingUp className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Balance</h1>
          <p className="text-sm text-muted-foreground">Estado de cuentas y quién le debe a quién</p>
        </div>
      </header>

      <section className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-soft">
          <Search className="h-6 w-6 text-muted-foreground animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Próximamente</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Cálculo automático de balances en tiempo real para saber cómo liquidar cuentas de forma simple.
          </p>
        </div>
      </section>
    </div>
  )
}
