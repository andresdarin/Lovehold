'use client'

import { Calculator, Plus, Trash2 } from 'lucide-react'
import { money } from '../constants'

export default function ExpenseItemsToolbar({
  itemsCount, itemsTotal, onAddItem, onUseItemsTotal, onClearItems,
}: {
  itemsCount: number
  itemsTotal: number
  onAddItem: () => void
  onUseItemsTotal: () => void
  onClearItems: () => void
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-foreground">Productos del ticket</h2>
          <span className="rounded-full bg-surface-soft px-2.5 py-0.5 text-xs font-semibold text-muted-foreground border border-border/40">
            {itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Revisá y editá los productos detectados en el ticket.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={onClearItems}
          disabled={itemsCount === 0}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-transparent bg-transparent text-muted-foreground transition hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
          aria-label="Eliminar todos los productos"
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onAddItem}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-surface-soft px-4 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
          Agregar producto
        </button>

        <button
          type="button"
          onClick={onUseItemsTotal}
          disabled={itemsCount === 0}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Calculator className="h-4 w-4" />
          Usar {money(itemsTotal)}
        </button>
      </div>
    </div>
  )
}
