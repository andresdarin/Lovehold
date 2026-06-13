'use client'

import { Inbox } from 'lucide-react'
import Link from 'next/link'

interface Props {
  hasFilters?: boolean
  onClearFilters?: () => void
}

export default function MovementEmptyState({ hasFilters, onClearFilters }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-soft">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-foreground">
          {hasFilters ? 'Sin resultados' : 'Todavía no hay movimientos'}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground max-w-sm">
          {hasFilters
            ? 'No hay movimientos con estos filtros.'
            : 'Cargá tu primer gasto para empezar tu historial.'}
        </p>
      </div>
      {hasFilters ? (
        <button type="button" onClick={onClearFilters}
          className="rounded-xl border border-border bg-surface-soft px-5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
          Limpiar filtros
        </button>
      ) : (
        <Link href="/expenses/new"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
          Nuevo gasto
        </Link>
      )}
    </div>
  )
}
