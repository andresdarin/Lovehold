'use client'

import Link from 'next/link'
import { ArrowLeft, Receipt } from 'lucide-react'

export default function NewExpenseHeader() {
  return (
    <header className="flex items-center justify-between pb-3 border-b border-border/40 select-none">
      {/* Botón Volver a la izquierda */}
      <Link href="/expenses"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:text-foreground hover:bg-surface-soft focus:outline-none"
        aria-label="Volver a movimientos">
        <ArrowLeft className="h-5 w-5" />
      </Link>
      
      {/* Título & Descripción centrados */}
      <div className="text-center flex-1">
        <h1 className="text-sm font-medium text-foreground">Nuevo gasto</h1>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Cargá un gasto compartido
        </p>
      </div>

      {/* Icono de tipo de gasto a la derecha */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center text-muted-foreground">
        <Receipt className="h-5 w-5" />
      </div>
    </header>
  )
}
