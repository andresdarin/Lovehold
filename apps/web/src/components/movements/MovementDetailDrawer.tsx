'use client'

import { X, Trash2, RotateCcw } from 'lucide-react'
import { money } from '../expenses/constants'
import { formatDate, kindLabel, kindColor, scopeLabel } from './utils'
import MovementItemsTable from './MovementItemsTable'
import type { Movement } from './types'

interface Props {
  movement: Movement | null
  onClose: () => void
}

export default function MovementDetailDrawer({ movement, onClose }: Props) {
  if (!movement) return null

  function handleDelete() {
    if (confirm('¿Estás seguro de que querés eliminar este gasto?')) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/65 lg:flex lg:justify-end" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del movimiento"
        className="scrollbar-salmon fixed inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl border border-border bg-surface p-5 shadow-2xl lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[420px] lg:rounded-l-2xl lg:rounded-tr-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-foreground">{movement.title || movement.merchant || 'Sin título'}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{formatDate(movement.date)}</p>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>

        {movement.merchant && movement.title && (
          <p className="mt-3 text-sm text-foreground">{movement.merchant}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{movement.category}</span>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${kindColor(movement.kind)}`}>{kindLabel(movement.kind)}</span>
          <span className="rounded-full bg-surface-soft px-3 py-1 text-xs font-medium text-muted-foreground">{scopeLabel(movement.scope)}</span>
          {movement.isRecurring && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
              <RotateCcw className="h-3 w-3" />
              {movement.recurringLabel || 'Recurrente'}
            </span>
          )}
        </div>

        <div className="mt-5">
          <p className="text-3xl font-bold text-foreground">{money(movement.total)}</p>
          {movement.paymentMethod && (
            <p className="mt-1 text-sm text-muted-foreground">{movement.paymentMethod}</p>
          )}
        </div>

        {movement.itemsCount > 0 && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <span className="text-sm font-semibold text-foreground">Productos ({movement.itemsCount})</span>
            </div>

            <div className="divide-y divide-border/50 text-sm">
              <div className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Suma de ítems</span>
                <span className="font-medium text-foreground">{money(movement.itemsTotal)}</span>
              </div>
              {movement.discounts != null && movement.discounts > 0 && (
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Descuentos</span>
                  <span className="font-medium text-success">-{money(movement.discounts)}</span>
                </div>
              )}
              {movement.discounts != null && movement.discounts > 0 && (
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Diferencia</span>
                  <span className="font-medium text-foreground">{money(movement.total - movement.itemsTotal + movement.discounts)}</span>
                </div>
              )}
            </div>

            <MovementItemsTable items={movement.items} />
          </div>
        )}

        {movement.notes && (
          <div className="mt-6">
            <p className="mb-1 text-sm font-semibold text-foreground">Notas</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{movement.notes}</p>
          </div>
        )}

        {movement.scope === 'household' && (
          <div className="mt-6 rounded-xl border border-border bg-surface-soft p-4 text-sm text-muted-foreground">
            Este gasto es compartido. La división estará disponible pronto.
          </div>
        )}

        <div className="mt-8">
          <button type="button" onClick={handleDelete}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface-soft px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30">
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}
