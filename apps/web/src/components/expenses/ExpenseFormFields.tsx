'use client'

import { ShoppingBasket } from 'lucide-react'
import type { ExpenseForm } from './types'

export default function ExpenseFormFields({
  form, profileName, onUpdate,
}: {
  form: ExpenseForm
  profileName: string
  onUpdate: (field: keyof ExpenseForm, value: string) => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ShoppingBasket className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Datos generales</h2>
          <p className="text-sm text-muted-foreground">El ticket se guarda como gasto compartido 50/50.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <TextField label="Título" value={form.title} onChange={(v) => onUpdate('title', v)} placeholder="Compra Tata" required />
        <TextField label="Comercio" value={form.merchant} onChange={(v) => onUpdate('merchant', v)} placeholder="Tata" />
        <TextField label="Categoría general" value={form.category} onChange={(v) => onUpdate('category', v)} placeholder="Compras de súper" required />
        <TextField label="Fecha" type="date" value={form.date} onChange={(v) => onUpdate('date', v)} required />
        <TextField label="Método de pago" value={form.paymentMethod} onChange={(v) => onUpdate('paymentMethod', v)} placeholder="Débito VISA" />
        <TextField label="Total declarado" type="number" min="0" step="0.01" value={form.amount} onChange={(v) => onUpdate('amount', v)} placeholder="0.00" required />
        <TextField label="Pagó" value={profileName} onChange={() => undefined} disabled />
        <TextField label="División" value="50/50 por ahora" onChange={() => undefined} disabled />
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Notas</span>
        <textarea
          value={form.notes}
          onChange={(e) => onUpdate('notes', e.target.value)}
          rows={3}
          placeholder="Algo útil para recordar esta compra"
          className="mt-2 w-full resize-none rounded-2xl border border-border bg-surface-soft px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>
    </div>
  )
}

function TextField({
  label, value, onChange, placeholder, type = 'text', disabled = false, required = false, min, step,
}: {
  label: string; value: string; onChange: (value: string) => void; placeholder?: string
  type?: string; disabled?: boolean; required?: boolean; min?: string; step?: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type={type} value={value} min={min} step={step} required={required} disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  )
}
