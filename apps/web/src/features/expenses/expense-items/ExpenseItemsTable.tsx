'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { ITEM_CATEGORIES } from '../constants'
import type { ExpenseItemForm } from '../types'

const inputClass = 'h-9 w-full rounded-lg border border-border bg-surface px-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
const iconButtonClass = 'flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30'

export default function ExpenseItemsTable({
  items, onUpdateItem, onRemoveItem, onEditItem,
}: {
  items: ExpenseItemForm[]
  onUpdateItem: (id: string, field: keyof ExpenseItemForm, value: string) => void
  onRemoveItem: (id: string) => void
  onEditItem: (id: string) => void
}) {
  return (
    <div className={`hidden lg:block ${items.length > 8 ? 'scrollbar-salmon max-h-[448px] overflow-y-auto pr-1' : ''}`}>
      <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
        <colgroup>
          <col className="w-[28%]" />
          <col className="w-[17%]" />
          <col className="w-[10%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[9%]" />
        </colgroup>
        <thead className="sticky top-0 z-10 bg-surface">
          <tr className="border-b border-border text-xs font-bold text-muted-foreground">
            <th className="border-b border-border px-2 py-3 text-left">Producto</th>
            <th className="border-b border-border px-2 py-3 text-left">Categoría</th>
            <th className="border-b border-border px-2 py-3 text-left">Cantidad</th>
            <th className="border-b border-border px-2 py-3 text-left">Unidad</th>
            <th className="border-b border-border px-2 py-3 text-left">Unitario</th>
            <th className="border-b border-border px-2 py-3 text-left">Total</th>
            <th className="border-b border-border px-2 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {items.map((item) => (
            <tr key={item.localId} className="h-[52px]">
              <td className="px-2 py-2">
                <input className={inputClass} value={item.name} required placeholder="Producto"
                  onChange={(event) => onUpdateItem(item.localId, 'name', event.target.value)}
                  aria-label="Producto" />
              </td>
              <td className="px-2 py-2">
                <select className={inputClass} value={item.itemCategory}
                  onChange={(event) => onUpdateItem(item.localId, 'itemCategory', event.target.value)}
                  aria-label="Categoría">
                  {ITEM_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </td>
              <td className="px-2 py-2">
                <input className={inputClass} type="number" min="0" step="0.001" value={item.quantity} placeholder="1"
                  onChange={(event) => onUpdateItem(item.localId, 'quantity', event.target.value)}
                  aria-label="Cantidad" />
              </td>
              <td className="px-2 py-2">
                <input className={inputClass} value={item.unit} placeholder="un"
                  onChange={(event) => onUpdateItem(item.localId, 'unit', event.target.value)}
                  aria-label="Unidad" />
              </td>
              <td className="px-2 py-2">
                <input className={inputClass} type="number" min="0" step="0.01" value={item.unitPrice} placeholder="0.00"
                  onChange={(event) => onUpdateItem(item.localId, 'unitPrice', event.target.value)}
                  aria-label="Unitario" />
              </td>
              <td className="px-2 py-2">
                <input className={inputClass} type="number" min="0" step="0.01" value={item.total} required placeholder="0.00"
                  onChange={(event) => onUpdateItem(item.localId, 'total', event.target.value)}
                  aria-label="Total" />
              </td>
              <td className="px-2 py-2">
                <div className="flex justify-end gap-2">
                  <button type="button" className={iconButtonClass} onClick={() => onEditItem(item.localId)} aria-label={`Editar ${item.name || 'producto'}`}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" className={`${iconButtonClass} hover:text-danger`} onClick={() => onRemoveItem(item.localId)} aria-label={`Eliminar ${item.name || 'producto'}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
