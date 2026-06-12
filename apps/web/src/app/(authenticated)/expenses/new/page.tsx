'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Plus,
  ReceiptText,
  Save,
  ShoppingBasket,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useProfile } from '@/components/auth/ProfileProvider'
import LiquidGlass from '@/components/ui/LiquidGlass'
import { ApiError, apiFetch } from '@/lib/api'
import { createClient } from '@/lib/supabase/client'

const ITEM_CATEGORIES = [
  { value: 'ALIMENTOS', label: 'Alimentos' },
  { value: 'VERDURAS', label: 'Verduras' },
  { value: 'FRUTAS', label: 'Frutas' },
  { value: 'LACTEOS', label: 'Lácteos' },
  { value: 'CARNES_FIAMBRES', label: 'Carnes y fiambres' },
  { value: 'PANIFICADOS', label: 'Panificados' },
  { value: 'BEBIDAS', label: 'Bebidas' },
  { value: 'ALCOHOL', label: 'Alcohol' },
  { value: 'SNACKS_DULCES', label: 'Snacks y dulces' },
  { value: 'HIGIENE', label: 'Higiene' },
  { value: 'LIMPIEZA_HOGAR', label: 'Limpieza hogar' },
  { value: 'MASCOTAS', label: 'Mascotas' },
  { value: 'OTROS', label: 'Otros' },
] as const

type ItemCategory = (typeof ITEM_CATEGORIES)[number]['value']

interface ExpenseItemForm {
  localId: string
  name: string
  itemCategory: ItemCategory
  quantity: string
  unit: string
  unitPrice: string
  total: string
}

interface ExpenseForm {
  title: string
  merchant: string
  category: string
  amount: string
  date: string
  paymentMethod: string
  notes: string
}

const EMPTY_ITEM: Omit<ExpenseItemForm, 'localId'> = {
  name: '',
  itemCategory: 'ALIMENTOS',
  quantity: '',
  unit: '',
  unitPrice: '',
  total: '',
}

const SAMPLE_ITEMS: Omit<ExpenseItemForm, 'localId' | 'quantity' | 'unit' | 'unitPrice'>[] = [
  { name: 'Huevos San Agustín 15 un', itemCategory: 'ALIMENTOS', total: '199.00' },
  { name: 'Papel higiénico SAK 30 mt x 16 ro', itemCategory: 'HIGIENE', total: '319.00' },
  { name: 'Cebolla colorada', itemCategory: 'VERDURAS', total: '10.01' },
  { name: 'Queso cheddar Conaprole', itemCategory: 'LACTEOS', total: '106.80' },
  { name: 'Goma en tubo Gomets', itemCategory: 'OTROS', total: '10.00' },
  { name: 'Panceta ahumada Doña Coca', itemCategory: 'CARNES_FIAMBRES', total: '146.20' },
  { name: 'Pan Bimbo artesano papa x4u', itemCategory: 'PANIFICADOS', total: '114.00' },
  { name: 'Cerveza Colina 473 ml', itemCategory: 'ALCOHOL', total: '49.00' },
  { name: 'Alfajor triple nieve Punta', itemCategory: 'SNACKS_DULCES', total: '39.00' },
  { name: 'Alfajor Portezuelo triple', itemCategory: 'SNACKS_DULCES', total: '39.00' },
  { name: 'Bolsa compostable 50x60', itemCategory: 'LIMPIEZA_HOGAR', total: '10.00' },
]

function makeItem(item: Partial<ExpenseItemForm> = {}): ExpenseItemForm {
  return {
    ...EMPTY_ITEM,
    ...item,
    localId: item.localId ?? `${Date.now()}-${Math.random()}`,
  }
}

function parseAmount(value: string) {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

function toCents(value: number) {
  return Math.round(value * 100)
}

function money(value: number) {
  return `$${value.toFixed(2)}`
}

function sumItems(items: ExpenseItemForm[]) {
  return items.reduce((sum, item) => sum + parseAmount(item.total), 0)
}

export default function NewExpensePage() {
  const { profile } = useProfile()
  const supabase = createClient()

  const [form, setForm] = useState<ExpenseForm>({
    title: '',
    merchant: '',
    category: 'Compras de súper',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: '',
    notes: '',
  })
  const [items, setItems] = useState<ExpenseItemForm[]>([])
  const [amountTouched, setAmountTouched] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const itemsTotal = sumItems(items)
  const declaredTotal = parseAmount(form.amount)
  const difference = items.length ? declaredTotal - itemsTotal : 0
  const hasBlockingDifference = items.length > 0 && Math.abs(toCents(difference)) > 5
  const isSupermarketExpense = form.category.toLowerCase().includes('súper') || form.category.toLowerCase().includes('super')
  const canSubmit = form.title.trim() && form.category.trim() && declaredTotal > 0 && form.date && !hasBlockingDifference && !isSubmitting

  function updateForm(field: keyof ExpenseForm, value: string) {
    if (field === 'amount') {
      setAmountTouched(true)
    }
    setForm((current) => ({ ...current, [field]: value }))
  }

  function setItemsAndMaybeTotal(nextItems: ExpenseItemForm[]) {
    setItems(nextItems)
    if (!amountTouched && nextItems.length > 0) {
      setForm((current) => ({ ...current, amount: sumItems(nextItems).toFixed(2) }))
    }
  }

  function addItem() {
    setItemsAndMaybeTotal([...items, makeItem()])
  }

  function removeItem(localId: string) {
    setItemsAndMaybeTotal(items.filter((item) => item.localId !== localId))
  }

  function updateItem(localId: string, field: keyof ExpenseItemForm, value: string) {
    const nextItems = items.map((item) => {
      if (item.localId !== localId) return item

      const nextItem = { ...item, [field]: value }
      const quantity = parseAmount(field === 'quantity' ? value : nextItem.quantity)
      const unitPrice = parseAmount(field === 'unitPrice' ? value : nextItem.unitPrice)

      if ((field === 'quantity' || field === 'unitPrice') && quantity > 0 && unitPrice > 0) {
        nextItem.total = (quantity * unitPrice).toFixed(2)
      }

      return nextItem
    })

    setItemsAndMaybeTotal(nextItems)
  }

  function useItemsTotalAsAmount() {
    setAmountTouched(false)
    setForm((current) => ({ ...current, amount: itemsTotal.toFixed(2) }))
  }

  function loadTataExample() {
    const sampleItems = SAMPLE_ITEMS.map((item, index) => makeItem({
      ...item,
      localId: `tata-${index}`,
      quantity: '',
      unit: '',
      unitPrice: '',
    }))

    setAmountTouched(false)
    setItems(sampleItems)
    setForm({
      title: 'Compra Tata',
      merchant: 'Tata',
      category: 'Compras de súper',
      amount: '1042.01',
      date: '2026-06-09',
      paymentMethod: 'Débito VISA',
      notes: '',
    })
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    if (hasBlockingDifference) {
      setError('La diferencia entre el total declarado y los ítems supera $0.05.')
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Tu sesión expiró. Volvé a iniciar sesión.')
      }

      await apiFetch('/api/expenses', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title.trim(),
          merchant: form.merchant.trim() || undefined,
          category: form.category.trim(),
          amount: declaredTotal,
          date: form.date,
          paymentMethod: form.paymentMethod.trim() || undefined,
          splitType: 'EQUAL',
          notes: form.notes.trim() || undefined,
          items: items.length
            ? items.map((item) => ({
                name: item.name.trim(),
                itemCategory: item.itemCategory,
                quantity: item.quantity ? parseAmount(item.quantity) : undefined,
                unit: item.unit.trim() || undefined,
                unitPrice: item.unitPrice ? parseAmount(item.unitPrice) : undefined,
                total: parseAmount(item.total),
              }))
            : undefined,
        }),
      }, session.access_token)

      setSuccess('Gasto cargado. Cuando activemos el listado, va a aparecer en movimientos.')
    } catch (err) {
      if (err instanceof ApiError) {
        setError(Array.isArray(err.message) ? err.message.join(', ') : err.message)
      } else {
        setError(err instanceof Error ? err.message : 'No se pudo guardar el gasto.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/expenses"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface text-muted-foreground transition hover:bg-surface-soft hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label="Volver a movimientos"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <ReceiptText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Nuevo gasto</h1>
            <p className="text-sm text-muted-foreground">Carga manual de ticket, lista para futura lectura con IA.</p>
          </div>
        </div>

        <LiquidGlass variant="button" intensity="medium" className="inline-flex self-start sm:self-auto">
          <button
            type="button"
            onClick={loadTataExample}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-foreground focus-visible:outline-none"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            Cargar ejemplo Tata
          </button>
        </LiquidGlass>
      </header>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
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
            <TextField label="Título" value={form.title} onChange={(value) => updateForm('title', value)} placeholder="Compra Tata" required />
            <TextField label="Comercio" value={form.merchant} onChange={(value) => updateForm('merchant', value)} placeholder="Tata" />
            <TextField label="Categoría general" value={form.category} onChange={(value) => updateForm('category', value)} placeholder="Compras de súper" required />
            <TextField label="Fecha" type="date" value={form.date} onChange={(value) => updateForm('date', value)} required />
            <TextField label="Método de pago" value={form.paymentMethod} onChange={(value) => updateForm('paymentMethod', value)} placeholder="Débito VISA" />
            <TextField label="Total declarado" type="number" min="0" step="0.01" value={form.amount} onChange={(value) => updateForm('amount', value)} placeholder="0.00" required />
            <TextField label="Pagó" value={profile?.displayName || profile?.email || 'Tu perfil'} onChange={() => undefined} disabled />
            <TextField label="División" value="50/50 por ahora" onChange={() => undefined} disabled />
          </div>

          <label className="mt-4 block">
            <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Notas</span>
            <textarea
              value={form.notes}
              onChange={(event) => updateForm('notes', event.target.value)}
              rows={3}
              placeholder="Algo útil para recordar esta compra"
              className="mt-2 w-full resize-none rounded-2xl border border-border bg-surface-soft px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Calculator className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Resumen</h2>
              <p className="text-sm text-muted-foreground">La diferencia permitida por redondeo es $0.05.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <SummaryRow label="Total de ítems" value={money(itemsTotal)} />
            <SummaryRow label="Total declarado" value={money(declaredTotal)} />
            <SummaryRow label="Diferencia" value={money(difference)} danger={hasBlockingDifference} />
          </div>

          {items.length > 0 && (
            <button
              type="button"
              onClick={useItemsTotalAsAmount}
              className="mt-4 w-full rounded-2xl border border-border bg-surface-soft px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Usar suma de ítems como total
            </button>
          )}

          {isSupermarketExpense && items.length === 0 && (
            <div className="mt-4 rounded-2xl border border-border bg-surface-soft p-4 text-sm text-muted-foreground">
              Para compras de súper conviene cargar productos: después esto alimenta las categorías mensuales.
            </div>
          )}

          {hasBlockingDifference && (
            <div className="mt-4 flex gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>La diferencia supera $0.05. Ajustá el total declarado o los ítems.</span>
            </div>
          )}

          {error && (
            <div className="mt-4 flex gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 flex gap-3 rounded-2xl border border-success/40 bg-success/10 p-4 text-sm text-success">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <LiquidGlass variant="button" intensity="medium" disabled={!canSubmit} className="mt-5 block">
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-foreground disabled:cursor-not-allowed focus-visible:outline-none"
            >
              <Save className="h-4 w-4 text-primary" />
              {isSubmitting ? 'Guardando…' : 'Guardar gasto'}
            </button>
          </LiquidGlass>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Productos del ticket</h2>
            <p className="mt-1 text-sm text-muted-foreground">Podés guardar un gasto sin ítems, pero el detalle producto por producto abre el análisis mensual.</p>
          </div>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface-soft px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Plus className="h-4 w-4 text-primary" />
            Agregar ítem
          </button>
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
                  <button
                    type="button"
                    onClick={() => removeItem(item.localId)}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground transition hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30"
                    aria-label={`Eliminar ítem ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(170px,0.8fr)] xl:grid-cols-[minmax(0,1.5fr)_180px_100px_100px_120px_120px]">
                  <TextField label="Producto" value={item.name} onChange={(value) => updateItem(item.localId, 'name', value)} placeholder="Huevos San Agustín" required />
                  <SelectField label="Categoría" value={item.itemCategory} onChange={(value) => updateItem(item.localId, 'itemCategory', value)} options={ITEM_CATEGORIES} />
                  <TextField label="Cantidad" type="number" min="0" step="0.001" value={item.quantity} onChange={(value) => updateItem(item.localId, 'quantity', value)} placeholder="1" />
                  <TextField label="Unidad" value={item.unit} onChange={(value) => updateItem(item.localId, 'unit', value)} placeholder="un" />
                  <TextField label="Unitario" type="number" min="0" step="0.01" value={item.unitPrice} onChange={(value) => updateItem(item.localId, 'unitPrice', value)} placeholder="0.00" />
                  <TextField label="Total" type="number" min="0" step="0.01" value={item.total} onChange={(value) => updateItem(item.localId, 'total', value)} placeholder="0.00" required />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </form>
  )
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  disabled = false,
  required = false,
  min,
  step,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
  required?: boolean
  min?: string
  step?: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        min={min}
        step={step}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-surface-soft disabled:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: ItemCategory) => void
  options: readonly { value: ItemCategory; label: string }[]
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as ItemCategory)}
        className="mt-2 h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function SummaryRow({ label, value, danger = false }: { label: string; value: string; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface-soft px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold ${danger ? 'text-danger' : 'text-foreground'}`}>{value}</span>
    </div>
  )
}
