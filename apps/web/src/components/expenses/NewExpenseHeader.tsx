'use client'

import Link from 'next/link'
import { ArrowLeft, ReceiptText } from 'lucide-react'

export default function NewExpenseHeader() {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Link href="/expenses"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface text-muted-foreground transition hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          aria-label="Volver a movimientos">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
          <ReceiptText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Nuevo gasto</h1>
          <p className="text-sm text-muted-foreground">
            Cargá un gasto compartido. Podés escanear un ticket o cargarlo manualmente.
          </p>
        </div>
      </div>
    </header>
  )
}
