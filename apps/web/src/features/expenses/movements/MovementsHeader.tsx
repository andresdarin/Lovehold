'use client'

import { Clock3 } from 'lucide-react'

export default function MovementsHeader() {
  return (
    <header className="flex items-center gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/25 text-primary bg-primary/5">
          <Clock3 className="h-4 w-4 stroke-[1.8]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Movimientos</h1>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Tu historial financiero</p>
        </div>
      </div>
    </header>
  )
}
