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
    <section className="rounded-2xl border border-border bg-surface/85 backdrop-blur-md p-6 shadow-md transition-all duration-300">
      <ExpenseItemsToolbar
        itemsCount={items.length}
        itemsTotal={sumItems(items)}
        onAddItem={onAddItem}
        onUseItemsTotal={onUseItemsTotal}
        onClearItems={clearItems}
      />

      <div className="mt-5">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface-soft p-6 text-center">
            <p className="font-semibold text-foreground">No se detectaron productos.</p>
            <p className="mt-1 text-sm text-muted-foreground">Podés guardar el gasto general o agregar ítems manualmente.</p>
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
