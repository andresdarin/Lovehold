'use client'

import React from 'react'
import { BadgeDollarSign } from 'lucide-react'

export default function FinanzasPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-surface-soft border border-border">
          <BadgeDollarSign className="h-5 w-5 text-foreground/80" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Finanzas Personales</h1>
          <p className="text-sm text-muted-foreground">Controlá tus finanzas personales y llevá un registro detallado</p>
        </div>
      </header>

      <section className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-soft">
          <BadgeDollarSign className="h-6 w-6 text-muted-foreground animate-pulse" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Próximamente</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Acá vas a poder gestionar tus ingresos, egresos, ahorros y llevar un control mensual de tus finanzas.
          </p>
        </div>
      </section>
    </div>
  )
}
