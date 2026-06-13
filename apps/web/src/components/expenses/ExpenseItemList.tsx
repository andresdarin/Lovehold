'use client'

import { Plus, Trash2, Sparkles } from 'lucide-react'
import LiquidGlass from '@/components/ui/LiquidGlass'
import { ITEM_CATEGORIES } from './constants'
import type { ExpenseItemForm } from './types'

export default function ExpenseItemList({
  items, onAddItem, onRemoveItem, onUpdateItem, onLoadExample,
}: {
  items: ExpenseItemForm[]
  onAddItem: () => void
  onRemoveItem: (id: string) => void
  onUpdateItem: (id: string, field: keyof ExpenseItemForm, value: string) => void
  onLoadExample: () => void
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Productos del ticket</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Podés guardar un gasto sin ítems, pero el detalle producto por producto abre el análisis mensual.
          </p>
        </div>
        <div className="flex gap-2">
          <LiquidGlass variant="button" intensity="medium" className="inline-flex">
            <button type="button" onClick={onLoadExample}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-foreground focus-visible:outline-none">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Ejemplo
            </button>
          </LiquidGlass>
          <button type="button" onClick={onAddItem}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface-soft px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
            <Plus className="h-4 w-4 text-primary" />
            Agregar
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface-soft p-8 text-center">
            <p className="font-semibold text-foreground">Todavía no agregaste productos.</p>
            <p className="mt-1 text-sm text-muted-foreground">Usá el ejemplo Tata o sumá el primer ítem manualmente.</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item.localId} className="rounded-2xl border border-border bg-surface-soft p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-surface px-3 py-1 text-xs font-bold text-muted-foreground">
                  Ítem {index + 1}
                </span>
                <button type="button" onClick={() => onRemoveItem(item.localId)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
                  aria-label={`Eliminar ítem ${index + 1}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(170px,0.8fr)] xl:grid-cols-[minmax(0,1.5fr)_180px_100px_100px_120px_120px]">
                <TextField label="Producto" value={item.name} onChange={(v) => onUpdateItem(item.localId, 'name', v)} placeholder="Huevos San Agustín" required />
                <SelectField label="Categoría" value={item.itemCategory} onChange={(v) => onUpdateItem(item.localId, 'itemCategory', v)} />
                <TextField label="Cantidad" type="number" min="0" step="0.001" value={item.quantity} onChange={(v) => onUpdateItem(item.localId, 'quantity', v)} placeholder="1" />
                <TextField label="Unidad" value={item.unit} onChange={(v) => onUpdateItem(item.localId, 'unit', v)} placeholder="un" />
                <TextField label="Unitario" type="number" min="0" step="0.01" value={item.unitPrice} onChange={(v) => onUpdateItem(item.localId, 'unitPrice', v)} placeholder="0.00" />
                <TextField label="Total" type="number" min="0" step="0.01" value={item.total} onChange={(v) => onUpdateItem(item.localId, 'total', v)} placeholder="0.00" required />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

function TextField({
  label, value, onChange, placeholder, type = 'text', required = false, min, step,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
  type?: string; required?: boolean; min?: string; step?: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input type={type} value={value} min={min} step={step} required={required} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
    </label>
  )
}

function SelectField({ label, value, onChange }: {
  label: string; value: string; onChange: (v: string) => void
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">
        {ITEM_CATEGORIES.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  )
}
