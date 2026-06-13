'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { money, parseAmount } from '../constants'
import type { ExpenseItemForm } from '../types'
import { categoryLabel, measureLabel } from './utils'

export default function ExpenseItemsMobileList({
  items, onRemoveItem, onEditItem,
}: {
  items: ExpenseItemForm[]
  onRemoveItem: (id: string) => void
  onEditItem: (id: string) => void
}) {
  return (
    <div className={`lg:hidden ${items.length > 8 ? 'scrollbar-salmon max-h-[520px] overflow-y-auto pr-1' : ''}`}>
      <div className="divide-y divide-border/70 border-y border-border/70">
        {items.map((item) => (
          <div key={item.localId} className="flex items-center gap-3 py-3">
            <button
              type="button"
              onClick={() => onEditItem(item.localId)}
              className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="min-w-0 truncate text-sm font-bold text-foreground">{item.name || 'Producto sin nombre'}</span>
                <span className="shrink-0 text-sm font-bold text-foreground">{money(parseAmount(item.total))}</span>
              </span>
              <span className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{categoryLabel(item.itemCategory)}</span>
                <span>{measureLabel(item)}</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => onEditItem(item.localId)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-soft text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label={`Editar ${item.name || 'producto'}`}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onRemoveItem(item.localId)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-soft text-muted-foreground transition hover:bg-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
              aria-label={`Eliminar ${item.name || 'producto'}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
