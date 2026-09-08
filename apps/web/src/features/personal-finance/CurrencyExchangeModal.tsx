'use client'

import React, { useState, useEffect } from 'react'
import { X, RefreshCw, Loader2 } from 'lucide-react'
import CustomDatePicker from '@/components/ui/CustomDatePicker'
import CustomSelect from '@/components/ui/CustomSelect'
import { useFinanceAccounts, useCreateTransfer } from './hooks'

interface CurrencyExchangeModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const inputCls =
  'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/45 tabular-nums'

function defaultRate(sourceCurrency: 'UYU' | 'USD', destinationCurrency: 'UYU' | 'USD') {
  return sourceCurrency === 'USD' && destinationCurrency === 'UYU' ? '39.50' : '0.0253'
}

export default function CurrencyExchangeModal({
  isOpen,
  onClose,
  onSuccess,
}: CurrencyExchangeModalProps) {
  const { accounts } = useFinanceAccounts()
  const { transfer, submitting } = useCreateTransfer()

  const [sourceAccountId, setSourceAccountId] = useState('')
  const [destinationAccountId, setDestinationAccountId] = useState('')
  const [sourceAmount, setSourceAmount] = useState('')
  const [destinationAmount, setDestinationAmount] = useState('')
  const [exchangeRate, setExchangeRate] = useState('39.50')
  const [feeAmount, setFeeAmount] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Solo cuentas líquidas; el destino debe ser la divisa opuesta.
  const liquidAccounts = accounts.filter((a) => a.type !== 'CREDIT')

  useEffect(() => {
    const currentSource = liquidAccounts.find((account) => account.id === sourceAccountId)
    const nextSource = currentSource ?? liquidAccounts.find((account) => account.currency === 'USD') ?? liquidAccounts[0]
    if (nextSource && nextSource.id !== sourceAccountId) {
      setSourceAccountId(nextSource.id)
    }

    const currentDestination = liquidAccounts.find((account) => account.id === destinationAccountId)
    const hasOppositeCurrency = currentDestination && nextSource &&
      currentDestination.id !== nextSource.id && currentDestination.currency !== nextSource.currency
    if (!hasOppositeCurrency) {
      const opposite = liquidAccounts.find(
        (account) => nextSource && account.id !== nextSource.id && account.currency !== nextSource.currency,
      )
      setDestinationAccountId(opposite?.id ?? '')
    }
  }, [liquidAccounts, sourceAccountId, destinationAccountId])

  if (!isOpen) return null

  const sourceAccount = accounts.find((a) => a.id === sourceAccountId)
  const destAccount = accounts.find((a) => a.id === destinationAccountId)

  const sourceCurrency = sourceAccount?.currency ?? 'USD'
  const destCurrency = destAccount?.currency ?? 'UYU'

  useEffect(() => {
    if (sourceAccount && destAccount && sourceCurrency !== destCurrency) {
      setExchangeRate(defaultRate(sourceCurrency, destCurrency))
    }
  }, [sourceCurrency, destCurrency, sourceAccount, destAccount])

  useEffect(() => {
    const amount = parseFloat(sourceAmount)
    const rate = parseFloat(exchangeRate)
    if (sourceAccount && destAccount && sourceCurrency !== destCurrency && amount > 0 && rate > 0) {
      setDestinationAmount((amount * rate).toFixed(2))
    }
  }, [sourceAmount, exchangeRate, sourceCurrency, destCurrency, sourceAccount, destAccount])

  // La cotización representa unidades recibidas por cada unidad entregada.
  function handleSourceAmountChange(val: string) {
    setSourceAmount(val)
    const num = parseFloat(val)
    const rate = parseFloat(exchangeRate)
    if (!isNaN(num) && !isNaN(rate) && rate > 0) {
      setDestinationAmount((num * rate).toFixed(2))
    }
  }

  function handleRateChange(val: string) {
    setExchangeRate(val)
    const num = parseFloat(sourceAmount)
    const rate = parseFloat(val)
    if (!isNaN(num) && !isNaN(rate) && rate > 0) {
      setDestinationAmount((num * rate).toFixed(2))
    }
  }

  const sourceOptions = liquidAccounts.map((a) => ({
    value: a.id,
    label: `${a.name} (${a.currency} • ${a.type === 'CASH' ? 'Efectivo' : 'Banco'})`,
  }))

  const destOptions = liquidAccounts
    .filter((a) => a.id !== sourceAccountId && a.currency !== sourceAccount?.currency)
    .map((a) => ({
      value: a.id,
      label: `${a.name} (${a.currency} • ${a.type === 'CASH' ? 'Efectivo' : 'Banco'})`,
    }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg(null)

    const numSrc = parseFloat(sourceAmount)
    const numDest = parseFloat(destinationAmount)

    if (isNaN(numSrc) || numSrc <= 0) {
      setErrorMsg('Ingresá un monto a entregar mayor a 0.')
      return
    }
    if (isNaN(numDest) || numDest <= 0) {
      setErrorMsg('El monto recibido debe ser mayor a 0.')
      return
    }
    if (!sourceAccountId || !destinationAccountId || sourceAccountId === destinationAccountId) {
      setErrorMsg('Seleccioná cuentas de origen y destino distintas.')
      return
    }
    if (!sourceAccount || !destAccount || sourceCurrency === destCurrency) {
      setErrorMsg('Elegí cuentas líquidas en monedas diferentes para convertir.')
      return
    }
    const rate = parseFloat(exchangeRate)
    if (isNaN(rate) || rate <= 0) {
      setErrorMsg('Ingresá una cotización válida mayor a 0.')
      return
    }

    try {
      await transfer({
        sourceAccountId,
        destinationAccountId,
        amount: numSrc,
        currency: sourceCurrency,
        destinationAmount: numDest,
        destinationCurrency: destCurrency,
        exchangeRate: rate,
        feeAmount: feeAmount ? parseFloat(feeAmount) : undefined,
        date: new Date(date).toISOString(),
      })
      onClose()
      onSuccess?.()
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al registrar cambio de moneda')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />
      <div className="neu-raised relative w-full max-w-md rounded-3xl border border-border/50 bg-surface p-6 z-10 select-none">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#A58D66]/40 text-[#A58D66] bg-transparent">
              <RefreshCw className="h-4 w-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Cambiar Moneda</h3>
              <p className="text-xs text-muted-foreground">Conversión y transferencia entre divisas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-surface-soft hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-xl bg-danger/10 border border-danger/20 p-3 text-xs text-danger">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {/* Entrega (Origen) */}
          <div className="rounded-2xl border border-border/70 bg-surface-soft/40 p-3.5 flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Entregás
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={sourceAmount}
                onChange={(e) => handleSourceAmountChange(e.target.value)}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-lg font-bold text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/45"
              />
              <span className="shrink-0 rounded-xl bg-surface border border-border px-3 py-2 text-sm font-bold text-foreground">
                {sourceCurrency}
              </span>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Desde cuenta
              </label>
              <CustomSelect
                options={sourceOptions}
                value={sourceAccountId}
                onChange={(val) => setSourceAccountId(val)}
              />
            </div>
          </div>

          {/* Recibe (Destino) */}
          <div className="rounded-2xl border border-border/70 bg-surface-soft/40 p-3.5 flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Recibís
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                readOnly
                placeholder="0.00"
                value={destinationAmount}
                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-lg font-bold text-[#2E7D6A] dark:text-[#4BE3B5] tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/45"
              />
              <span className="shrink-0 rounded-xl bg-surface border border-border px-3 py-2 text-sm font-bold text-foreground">
                {destCurrency}
              </span>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                En cuenta
              </label>
              <CustomSelect
                options={destOptions}
                value={destinationAccountId}
                onChange={(val) => setDestinationAccountId(val)}
              />
            </div>
          </div>

          {/* Tipo de cambio y comisión */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Cotización (1 {sourceCurrency} =)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="any"
                  value={exchangeRate}
                  onChange={(e) => handleRateChange(e.target.value)}
                  className={inputCls}
                />
                <span className="text-xs font-bold text-muted-foreground">{destCurrency}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Comisión ({sourceCurrency}, opcional)
              </label>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                className={inputCls}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">Se descuenta de la cuenta de origen.</p>
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Fecha</label>
            <CustomDatePicker value={date} onChange={setDate} />
          </div>

          {/* Botones de acción */}
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border bg-surface-soft py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-border/40"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:bg-primary-hover active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <span>Confirmar cambio</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
