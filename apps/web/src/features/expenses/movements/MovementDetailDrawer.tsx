'use client'

import { X, Trash2, RotateCcw } from 'lucide-react'
import { formatAmount, formatDate, kindLabel, kindTone, scopeLabel } from './utils'
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
    <>
      <div className="fixed inset-0 z-40 bg-black/75" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del movimiento"
        className="pointer-events-auto fixed inset-x-0 bottom-0 z-50 flex max-h-[88vh] flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#121212] shadow-2xl lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[420px] lg:rounded-l-2xl lg:rounded-tr-none dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-5 pb-0 pt-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-foreground">{movement.title || movement.merchant || 'Sin título'}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{formatDate(movement.date)}</p>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-white/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Cerrar">
            <X className="h-4 w-4" />
          </button>
        </div>

        {movement.merchant && movement.title && (
          <p className="px-5 pt-3 text-sm text-foreground">{movement.merchant}</p>
        )}

        <div className="flex flex-wrap items-center gap-1.5 px-5 pt-4">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${kindTone(movement.kind)}`}>
            {kindLabel(movement.kind)}
          </span>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">{scopeLabel(movement.scope)}</span>
          {movement.isRecurring && (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
              <RotateCcw className="h-3 w-3" />
              {movement.recurringLabel || 'Recurrente'}
            </span>
          )}
        </div>

        <div className="border-b border-white/5 px-5 pb-5 pt-5">
          <p className="text-3xl font-bold text-foreground tabular-nums">{formatAmount(movement.total)}</p>
          {movement.paymentMethod && (
            <p className="mt-1 text-sm text-muted-foreground">{movement.paymentMethod}</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {movement.itemsCount > 0 && (
            <div className="pt-5">
              <p className="mb-3 text-sm font-semibold text-foreground">Productos ({movement.itemsCount})</p>

              <div className="divide-y divide-white/5 text-sm">
                {movement.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="truncate font-medium text-foreground">{item.name}</p>
                      <div className="mt-0.5 flex gap-2 text-[11px] text-muted-foreground">
                        {item.quantity != null && <span>qty: {item.quantity}{item.unit ? ` ${item.unit}` : ''}</span>}
                        {item.unitPrice != null && <span>ud: {formatAmount(item.unitPrice)}</span>}
                        {item.category && <span className="truncate">{item.category}</span>}
                      </div>
                    </div>
                    <p className="shrink-0 font-semibold text-foreground tabular-nums">{formatAmount(item.totalPrice)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-2 divide-y divide-white/5 border-t border-white/5 text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Suma de ítems</span>
                  <span className="font-medium text-foreground tabular-nums">{formatAmount(movement.itemsTotal)}</span>
                </div>
                {movement.discounts != null && movement.discounts > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Descuentos</span>
                    <span className="font-medium text-emerald-400 tabular-nums">-{formatAmount(movement.discounts)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {movement.notes && (
            <div className="pt-6">
              <p className="mb-1 text-sm font-semibold text-foreground">Notas</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{movement.notes}</p>
            </div>
          )}

          {movement.scope === 'household' && (
            <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm text-muted-foreground">
              Este gasto es compartido. La división estará disponible pronto.
            </div>
          )}
        </div>

        <div className="border-t border-white/5 px-5 py-4">
          <button type="button" onClick={handleDelete}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:bg-white/5 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/30">
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
        </div>
      </div>
    </>
  )
}
