'use client'

import React from 'react'
import { X } from 'lucide-react'
import { formatDate, formatMovementAmount, getMovementDisplayTitle } from './utils'
import type { Movement } from './types'

interface Props {
  movement: Movement | null
  onClose: () => void
}

export default function MovementDetailDrawer({ movement, onClose }: Props) {
  if (!movement) return null

  const type = movement.financialType ?? 'EXPENSE'
  const isIncome = type === 'INCOME'
  const isFX = type === 'FX'
  const isTransfer = type === 'TRANSFER'
  const isCardPayment = type === 'CARD_PAYMENT'

  const labels: Record<string, string> = {
    EXPENSE: 'Egreso',
    INCOME: 'Ingreso',
    TRANSFER: 'Transferencia',
    FX: 'Cambio de moneda',
    CARD_PAYMENT: 'Pago de tarjeta',
  }

  const fields = [
    ['Tipo', labels[type]],
    ['Categoría', movement.category],
    ['Cuenta origen', movement.accountName],
    ['Cuenta destino', movement.destinationAccountName],
    ['Medio de pago', movement.paymentMethod],
    ['Fecha', formatDate(movement.date)],
    ['Comercio', movement.merchant],
    ['Ticket asociado', movement.ticketId ? `#${movement.ticketId.slice(0, 8)}` : null],
    [
      'Tasa histórica',
      movement.exchangeRate ? `1 USD = ${formatMovementAmount(movement.exchangeRate, 'UYU')}` : null,
    ],
  ].filter((field): field is [string, string] => Boolean(field[1]))

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del movimiento"
        className="neu-raised fixed inset-x-0 bottom-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl border border-border/50 bg-surface lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[420px] lg:rounded-l-3xl lg:rounded-tr-none select-none flex flex-col"
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-4 border-b border-border/60 p-6">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#A58D66]">
              {labels[type] ?? 'Movimiento'}
            </span>
            <h2 className="mt-1 truncate text-lg sm:text-xl font-bold text-foreground">
              {isCardPayment
                ? `Pago ${movement.paymentMethod ?? movement.title}`
                : isFX
                ? 'Cambio de moneda'
                : getMovementDisplayTitle(movement)}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(movement.date)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-2 text-muted-foreground hover:bg-surface-soft hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Monto Principal */}
        <div className="border-b border-border/60 p-6 bg-surface-soft/30">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Monto total</p>
          <p
            className={`text-3xl font-extrabold tabular-nums tracking-tight ${
              isIncome
                ? 'text-[#2E7D6A] dark:text-[#4BE3B5]'
                : isFX
                ? 'text-[#A58D66]'
                : isTransfer || isCardPayment
                ? 'text-[#407E8C] dark:text-[#C0D5D6]'
                : 'text-foreground'
            }`}
          >
            {isFX && movement.sourceAmount != null && movement.destinationAmount != null
              ? `${formatMovementAmount(movement.sourceAmount, movement.currency)} → ${formatMovementAmount(
                  movement.destinationAmount,
                  movement.currency === 'USD' ? 'UYU' : 'USD'
                )}`
              : isIncome
              ? `+${formatMovementAmount(Math.abs(movement.total), movement.currency)}`
              : type === 'EXPENSE'
              ? `-${formatMovementAmount(Math.abs(movement.total), movement.currency)}`
              : formatMovementAmount(movement.total, movement.currency)}
          </p>

          {isFX && movement.exchangeRate && (
            <p className="mt-2 text-xs font-semibold text-[#A58D66]">
              Cotización real: 1 USD = {formatMovementAmount(movement.exchangeRate, 'UYU')}
            </p>
          )}
        </div>

        {/* Atributos / Campos */}
        <dl className="px-6 py-3 divide-y divide-border/40 flex-1">
          {fields.map(([label, value]) => (
            <div key={label} className="flex justify-between items-center gap-4 py-3">
              <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
              <dd className="max-w-[65%] truncate text-right text-xs font-bold text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {/* Notas / Observaciones */}
        {movement.notes && (
          <div className="m-6 rounded-2xl bg-surface-soft border border-border/70 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Notas / Observaciones
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-xs text-foreground font-medium leading-relaxed">
              {movement.notes}
            </p>
          </div>
        )}
      </aside>
    </>
  )
}
