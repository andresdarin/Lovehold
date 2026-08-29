'use client'

import React from 'react'
import { Inbox, RotateCcw } from 'lucide-react'

interface Props {
  hasFilters?: boolean
  onClearFilters?: () => void
}

export default function MovementEmptyState({ hasFilters, onClearFilters }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-border/80 bg-surface px-6 py-16 text-center shadow-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 text-primary bg-transparent">
        <Inbox className="h-5 w-5 stroke-[1.8]" />
      </div>

      <h3 className="mt-3.5 text-sm font-bold text-foreground">
        {hasFilters ? 'Sin resultados para los filtros' : 'No hay movimientos todavía'}
      </h3>

      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
        {hasFilters
          ? 'Probá cambiando el mes o los criterios de búsqueda.'
          : 'Tus ingresos, egresos, transferencias y cambios de moneda aparecerán acá.'}
      </p>

      {hasFilters && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface-soft px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface hover:border-primary/40 transition-colors shadow-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restablecer filtros
        </button>
      )}
    </div>
  )
}
