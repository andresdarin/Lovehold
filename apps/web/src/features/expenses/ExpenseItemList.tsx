import { useState } from 'react'
import { ShoppingBasket, PackageOpen, Plus, Check } from 'lucide-react'
import { money, sumItems } from './constants'
import ExpenseItemEditDrawer from './expense-items/ExpenseItemEditDrawer'
import ExpenseItemsMobileList from './expense-items/ExpenseItemsMobileList'
import ExpenseItemsTable from './expense-items/ExpenseItemsTable'
import type { ExpenseItemForm } from './types'

export default function ExpenseItemList({
  items, onAddItem, onRemoveItem, onUpdateItem, onUseItemsTotal,
}: {
  items: ExpenseItemForm[]
  onAddItem: () => void
  onRemoveItem: (id: string) => void
  onUpdateItem: (id: string, field: keyof ExpenseItemForm, value: string) => void
  onUseItemsTotal: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const editingItem = items.find((item) => item.localId === editingId) ?? null

  const itemsTotal = sumItems(items)

  function removeItem(id: string) {
    onRemoveItem(id)
    if (editingId === id) setEditingId(null)
  }

  return (
    <section className="rounded-xl border-[0.5px] border-white/[0.08] bg-[#121214]/60 backdrop-blur-[20px] p-4 transition-all duration-200 select-none flex flex-col gap-3">
      {/* Header en una fila con Badge */}
      <div className="pb-3 border-b-[0.5px] border-white/[0.08] flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBasket className="h-[18px] w-[18px] text-foreground" />
            <h2 className="text-[15px] font-medium text-foreground">Productos del ticket</h2>
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded-full">
            {items.length} {items.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">Revisá y editá los productos detectados en el ticket.</p>
      </div>

      {/* Contenido / Listado de Productos */}
      <div>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-transparent gap-2 select-none">
            <PackageOpen className="h-8 w-8 text-muted-foreground/60" />
            <p className="text-sm font-medium text-foreground">No se detectaron productos.</p>
            <p className="text-[13px] text-muted-foreground max-w-[280px]">
              Podés guardar el gasto general o agregar ítems manualmente.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <ExpenseItemsTable
              items={items}
              onUpdateItem={onUpdateItem}
              onRemoveItem={removeItem}
              onEditItem={setEditingId}
            />
            <ExpenseItemsMobileList
              items={items}
              onRemoveItem={removeItem}
              onEditItem={setEditingId}
            />
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col gap-2 mt-1">
        {/* Botón Agregar producto (Ghost/Outline) */}
        <button
          type="button"
          onClick={onAddItem}
          className="w-full flex items-center justify-center gap-1.5 h-11 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm font-medium text-foreground hover:bg-white/[0.06] transition-colors focus:outline-none"
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
          Agregar producto
        </button>

        {/* Botón de acción principal "Usar $X,XX" (Único con fill de color) */}
        <button
          type="button"
          onClick={onUseItemsTotal}
          disabled={items.length === 0}
          className="w-full flex items-center justify-center gap-1.5 h-12 rounded-lg bg-primary text-sm font-medium text-white hover:bg-primary/90 transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="h-4 w-4" />
          Usar {money(itemsTotal)}
        </button>
      </div>

      <ExpenseItemEditDrawer
        item={editingItem}
        onClose={() => setEditingId(null)}
        onUpdateItem={onUpdateItem}
        onRemoveItem={removeItem}
      />
    </section>
  )
}
