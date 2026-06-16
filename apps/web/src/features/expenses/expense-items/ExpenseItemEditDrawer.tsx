'use client'

import { Trash2, X } from 'lucide-react'
import CustomSelect from '@/components/ui/CustomSelect'
import { ITEM_CATEGORIES } from '../constants'
import type { ExpenseItemForm } from '../types'

export default function ExpenseItemEditDrawer({
  item, onClose, onUpdateItem, onRemoveItem,
}: {
  item: ExpenseItemForm | null
  onClose: () => void
  onUpdateItem: (id: string, field: keyof ExpenseItemForm, value: string) => void
  onRemoveItem: (id: string) => void
}) {
  if (!item) return null
  const currentItem = item

  function update(field: keyof ExpenseItemForm, value: string) {
    onUpdateItem(currentItem.localId, field, value)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/65 lg:flex lg:justify-end" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Editar producto"
        className="scrollbar-salmon fixed inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl border border-border bg-surface p-5 shadow-2xl lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[420px] lg:rounded-l-2xl lg:rounded-tr-none"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-foreground">Editar producto</h2>
            <p className="mt-1 text-sm text-muted-foreground">Los cambios quedan en el formulario antes de guardar.</p>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Cerrar editor">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          <DrawerField label="Producto" value={currentItem.name} onChange={(value) => update('name', value)} placeholder="Producto" required />
          <div className="block">
            <span className="text-sm font-medium text-muted-foreground">Categoría</span>
            <CustomSelect
              className="mt-2 w-full"
              value={currentItem.itemCategory}
              options={ITEM_CATEGORIES}
              onChange={(value) => update('itemCategory', value)}
              placeholder="Categoría"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DrawerField label="Cantidad" type="number" min="0" step="0.001" value={currentItem.quantity} onChange={(value) => update('quantity', value)} placeholder="1" />
            <DrawerField label="Unidad" value={currentItem.unit} onChange={(value) => update('unit', value)} placeholder="un" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <DrawerField label="Unitario" type="number" min="0" step="0.01" value={currentItem.unitPrice} onChange={(value) => update('unitPrice', value)} placeholder="0.00" />
            <DrawerField label="Total" type="number" min="0" step="0.01" value={currentItem.total} onChange={(value) => update('total', value)} placeholder="0.00" required />
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => { onRemoveItem(currentItem.localId); onClose() }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface-soft px-4 text-sm font-semibold text-muted-foreground transition hover:bg-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30">
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
          <button type="button" onClick={onClose}
            className="h-11 rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
            Listo
          </button>
        </div>
      </div>
    </div>
  )
}

function DrawerField({
  label, value, onChange, placeholder, type = 'text', required = false, min, step,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  min?: string
  step?: string
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <input type={type} value={value} min={min} step={step} required={required} placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
    </label>
  )
}
