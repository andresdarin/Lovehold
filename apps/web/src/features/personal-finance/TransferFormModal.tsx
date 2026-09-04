'use client'

import React, { useState, useEffect } from 'react'
import { X, ArrowLeftRight, CreditCard, Loader2 } from 'lucide-react'
import CustomDatePicker from '@/components/ui/CustomDatePicker'
import CustomSelect from '@/components/ui/CustomSelect'
import { useFinanceAccounts, useCreateTransfer } from './hooks'

interface TransferFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const inputCls =
  'neu-inset h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 transition-colors'

const CURRENCY_OPTIONS = [
  { value: 'UYU', label: 'UYU ($)' },
  { value: 'USD', label: 'USD (U$S)' },
]

export default function TransferFormModal({
  isOpen,
  onClose,
  onSuccess,
}: TransferFormModalProps) {
  const { accounts } = useFinanceAccounts()
  const { transfer, submitting } = useCreateTransfer()

  const [sourceAccountId, setSourceAccountId] = useState('')
  const [destinationAccountId, setDestinationAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<'UYU' | 'USD'>('UYU')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Source accounts should normally be liquid (CASH or BANK)
  const sourceAccounts = accounts.filter((a) => a.type !== 'CREDIT')
  const destAccounts = accounts

  useEffect(() => {
    if (sourceAccounts.length > 0 && !sourceAccountId && sourceAccounts[0]?.id) {
      setSourceAccountId(sourceAccounts[0].id)
    }
    if (destAccounts.length > 1 && !destinationAccountId) {
      const other = destAccounts.find((a) => a.id !== (sourceAccounts[0]?.id ?? ''))
      if (other) setDestinationAccountId(other.id)
    }
  }, [sourceAccounts, destAccounts, sourceAccountId, destinationAccountId])

  if (!isOpen) return null

  const destAccount = accounts.find((a) => a.id === destinationAccountId)
  const isCreditPayment = destAccount?.type === 'CREDIT'

  const sourceOptions = sourceAccounts.map((a) => ({
    value: a.id,
    label: `${a.name} (${a.type === 'CASH' ? 'Efectivo' : 'Banco'})`,
  }))

  const destOptions = destAccounts
    .filter((a) => a.id !== sourceAccountId)
    .map((a) => {
      const typeLabel =
        a.type === 'CREDIT' ? 'Tarjeta de Crédito' : a.type === 'CASH' ? 'Efectivo' : 'Banco'
      return {
        value: a.id,
        label: `${a.name} (${typeLabel})`,
      }
    })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Ingresá un monto válido mayor a 0.')
      return
    }
    if (sourceAccountId === destinationAccountId) {
      setErrorMsg('La cuenta de origen y destino deben ser distintas.')
      return
    }

    try {
      await transfer({
        sourceAccountId,
        destinationAccountId,
        amount: numAmount,
        currency,
        date: new Date(date).toISOString(),
        description: description.trim() || undefined,
      })
      onClose()
      onSuccess?.()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al realizar transferencia')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="neu-raised relative w-full max-w-md rounded-3xl border border-border/50 bg-surface p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ArrowLeftRight className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                {isCreditPayment ? 'Pago de Tarjeta de Crédito' : 'Transferencia entre Cuentas'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {isCreditPayment
                  ? 'Cancela deuda acumulada'
                  : 'Mover fondos sin alterar gastos'}
              </p>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Desde (Origen)
              </label>
              <CustomSelect
                className="w-full"
                value={sourceAccountId}
                options={sourceOptions}
                onChange={setSourceAccountId}
                placeholder="Origen"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">
                Hacia (Destino)
              </label>
              <CustomSelect
                className="w-full"
                value={destinationAccountId}
                options={destOptions}
                onChange={setDestinationAccountId}
                placeholder="Destino"
              />
            </div>
          </div>

          {/* Contextual Smart Hint */}
          <div
            className={`rounded-xl border p-3 text-xs ${
              isCreditPayment
                ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                : 'border-primary/20 bg-primary/5 text-muted-foreground'
            }`}
          >
            {isCreditPayment ? (
              <div className="flex items-start gap-2">
                <CreditCard className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <p>
                  <strong>Pago de Tarjeta:</strong> Reducirá la deuda acumulada de la tarjeta y
                  descontará el saldo bancario. <strong>NO computa como gasto</strong> para no
                  duplicar lo ya registrado en tus compras.
                </p>
              </div>
            ) : (
              <p>
                Transferencia interna: Mueve fondos entre tus cuentas propias sin alterar los gastos
                ni ingresos del mes.
              </p>
            )}
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
              <CustomSelect
                className="w-full"
                value={currency}
                options={CURRENCY_OPTIONS}
                onChange={(val) => setCurrency(val as 'UYU' | 'USD')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Fecha</label>
              <CustomDatePicker value={date} onChange={setDate} required className="w-full" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-foreground">Notas (opcional)</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={inputCls}
                placeholder="Ej: Pago total del resumen"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-xs transition hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {submitting ? 'Procesando...' : isCreditPayment ? 'Confirmar Pago' : 'Confirmar Transferencia'}
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
