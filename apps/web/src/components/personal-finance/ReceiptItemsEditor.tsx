'use client'

import React from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { SUPERMARKET_ITEM_CATEGORIES } from './constants'
import type { DetectedReceiptItem } from './types'

interface ReceiptItemsEditorProps {
  items: DetectedReceiptItem[]
  onChange: (items: DetectedReceiptItem[]) => void
}

let nextId = 1
function newId() { return `item_${nextId++}` }

export default function ReceiptItemsEditor({ items, onChange }: ReceiptItemsEditorProps) {
  function updateItem(id: string, field: keyof DetectedReceiptItem, value: unknown) {
    onChange(items.map((item) => {
      if (item.id !== id) return item
      const updated = { ...item, [field]: value }
      if (field === 'quantity' || field === 'unitPrice') {
        const q = field === 'quantity' ? (value as number) : item.quantity
        const p = field === 'unitPrice' ? (value as number) : item.unitPrice
        if (q !== null && p !== null) {
          updated.totalPrice = Math.round(q * p * 100) / 100
        }
      }
      return updated
    }))
  }

  function removeItem(id: string) {
    onChange(items.filter((i) => i.id !== id))
  }

  function addItem() {
    onChange([...items, { id: newId(), name: '', quantity: null, unitPrice: null, totalPrice: 0, category: 'alimentos', rawLine: null }])
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-2.5">
          <input value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-border bg-surface-soft px-2.5 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45"
            placeholder="Producto" />
          <input type="number" step="0.01" min="0" value={item.quantity ?? ''} onChange={(e) => updateItem(item.id, 'quantity', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-16 rounded-lg border border-border bg-surface-soft px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45"
            placeholder="Cant" />
          <input type="number" step="0.01" min="0" value={item.unitPrice ?? ''} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-20 rounded-lg border border-border bg-surface-soft px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45"
            placeholder="P.Unit" />
          <span className="w-20 text-right text-sm font-semibold text-foreground">${item.totalPrice.toFixed(2)}</span>
          <select value={item.category} onChange={(e) => updateItem(item.id, 'category', e.target.value)}
            className="rounded-lg border border-border bg-surface-soft px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45">
            {SUPERMARKET_ITEM_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <button type="button" onClick={() => removeItem(item.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-danger/10 hover:text-danger focus:outline-none focus:ring-2 focus:ring-primary/45">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/45">
        <Plus className="h-4 w-4" /> Agregar ítem
      </button>
    </div>
  )
}
