'use client'

import { useState } from 'react'
import { sumItems } from './constants'
import ExpenseItemEditDrawer from './expense-items/ExpenseItemEditDrawer'
import ExpenseItemsMobileList from './expense-items/ExpenseItemsMobileList'
import ExpenseItemsTable from './expense-items/ExpenseItemsTable'
import ExpenseItemsToolbar from './expense-items/ExpenseItemsToolbar'
import type { ExpenseItemForm } from './types'

export default function ExpenseItemList({
  items, onAddItem, onRemoveItem, onClearItems, onUpdateItem, onUseItemsTotal,
}: {
  items: ExpenseItemForm[]
  onAddItem: () => void
  onRemoveItem: (id: string) => void
  onClearItems: () => void
  onUpdateItem: (id: string, field: keyof ExpenseItemForm, value: string) => void
  onUseItemsTotal: () => void
}) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const editingItem = items.find((item) => item.localId === editingId) ?? null

  function removeItem(id: string) {
    onRemoveItem(id)
    if (editingId === id) setEditingId(null)
  }

  function clearItems() {
    if (items.length > 1 && !window.confirm('¿Eliminar todos los productos del ticket?')) return
    onClearItems()
    setEditingId(null)
  }

  return (
    <section className="rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-white/[0.055] to-white/[0.025] p-4 shadow-md transition-all duration-300">
      <ExpenseItemsToolbar
        itemsCount={items.length}
        itemsTotal={sumItems(items)}
        onAddItem={onAddItem}
        onUseItemsTotal={onUseItemsTotal}
        onClearItems={clearItems}
      />

      <div className="mt-4">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] p-5 text-center">
            <p className="text-xs font-bold text-foreground">No se detectaron productos.</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Podés guardar el gasto general o agregar ítems manualmente.</p>
          </div>
        ) : (
          <>
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
          </>
        )}
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
