'use client'

import React, { useState, useEffect } from 'react'
import { X, ArrowUp, Loader2 } from 'lucide-react'
import CustomDatePicker from '@/components/ui/CustomDatePicker'
import CustomSelect from '@/components/ui/CustomSelect'
import { useFinanceAccounts, useRegisterIncome } from './hooks'

interface IncomeFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const inputCls =
  'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/45'

const INCOME_CATEGORIES = [
  { value: 'sueldo', label: 'Sueldo / Salario' },
  { value: 'honorarios', label: 'Honorarios / Freelance' },
  { value: 'venta', label: 'Venta de artículo' },
  { value: 'reembolso', label: 'Reembolso / Devolución' },
  { value: 'otros_ingresos', label: 'Otros ingresos' },
]

export default function IncomeFormModal({ isOpen, onClose, onSuccess }: IncomeFormModalProps) {
  const { accounts } = useFinanceAccounts()
  const { income, submitting } = useRegisterIncome()

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'UYU' | 'USD'>('UYU')
  const [category, setCategory] = useState(INCOME_CATEGORIES[0]?.value ?? 'sueldo')
  const [accountId, setAccountId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Filter liquid accounts (CASH or BANK) for income deposits
  const liquidAccounts = accounts.filter((a) => a.type !== 'CREDIT')

  useEffect(() => {
    if (liquidAccounts.length > 0 && !accountId && liquidAccounts[0]?.id) {
      setAccountId(liquidAccounts[0].id)
    }
  }, [liquidAccounts, accountId])

  if (!isOpen) return null

  const accountOptions = liquidAccounts.map((a) => ({
    value: a.id,
    label: `${a.name} (${a.type === 'CASH' ? 'Efectivo' : 'Banco'})`,
  }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Ingresá un monto válido mayor a 0.')
      return
    }

    try {
      await income({
        title: title.trim(),
        amount: numAmount,
        currency,
        dueOn: new Date(date).toISOString(),
        accountId: accountId || undefined,
        category,
      })
      onClose()
      onSuccess?.()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al registrar ingreso')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ArrowUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Registrar Ingreso</h2>
              <p className="text-xs text-muted-foreground">Añade fondos a tu cuenta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-surface-soft hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">Concepto</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputCls}
              placeholder="Ej: Sueldo mensual, Cobro de factura"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-semibold text-foreground">Monto</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className={inputCls}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as 'UYU' | 'USD')}
                className={inputCls}
              >
                <option value="UYU">UYU ($)</option>
                <option value="USD">USD (U$S)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-foreground">
              Cuenta de destino
            </label>
            <CustomSelect
              className="w-full"
              value={accountId}
              options={accountOptions}
              onChange={setAccountId}
              placeholder="Seleccionar cuenta"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Categoría</label>
              <CustomSelect
                className="w-full"
                value={category}
                options={INCOME_CATEGORIES}
                onChange={setCategory}
                placeholder="Categoría"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Fecha</label>
              <CustomDatePicker value={date} onChange={setDate} required className="w-full" />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? 'Guardando...' : 'Confirmar Ingreso'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-surface-soft"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
