'use client'

import Link from 'next/link'
import { ArrowLeft, ReceiptText } from 'lucide-react'

export default function NewExpenseHeader() {
  return (
    <header className="flex items-center gap-2.5 mb-4">
      {/* Botón Volver */}
      <Link href="/expenses"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-surface text-muted-foreground transition hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        aria-label="Volver a movimientos">
        <ArrowLeft className="h-4 w-4" />
      </Link>
      
      {/* Icono de Gasto */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <ReceiptText className="h-4 w-4 text-primary" />
      </div>

      {/* Título & Descripción */}
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight text-foreground leading-snug">Nuevo gasto</h1>
        <p className="text-[12px] text-muted-foreground/90 leading-tight">
          Cargá un gasto compartido. Podés escanear un ticket o cargarlo manualmente.
        </p>
      </div>
    </header>
  )
}
