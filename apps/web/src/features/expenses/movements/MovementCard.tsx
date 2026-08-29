'use client'

import { ArrowRightLeft, ArrowUpRight, CreditCard, Receipt, WalletCards, ChevronRight } from 'lucide-react'
import { formatMovementAmount, getMovementDisplayTitle, getMovementSubtitleParts } from './utils'
import type { Movement } from './types'

interface Props { movement: Movement; onClick: (m: Movement) => void }

export default function MovementCard({ movement, onClick }: Props) {
  const type = movement.financialType ?? 'EXPENSE'
  const isIncome = type === 'INCOME'
  const Icon = type === 'FX' ? ArrowRightLeft : type === 'TRANSFER' ? ArrowRightLeft : type === 'CARD_PAYMENT' ? CreditCard : isIncome ? ArrowUpRight : movement.itemsCount > 0 ? Receipt : WalletCards
  const tone = isIncome ? 'text-[#407E8C]' : type === 'FX' ? 'text-[#A58D66]' : type === 'TRANSFER' || type === 'CARD_PAYMENT' ? 'text-[#407E8C]' : 'text-[#083A4F] dark:text-[#C0D5D6]'
  const title = type === 'CARD_PAYMENT' ? `Pago ${movement.paymentMethod ?? movement.title}` : type === 'FX' ? 'Cambio de moneda' : getMovementDisplayTitle(movement)
  const subtitle = type === 'FX' && movement.sourceAmount != null && movement.destinationAmount != null
    ? `${formatMovementAmount(movement.sourceAmount, movement.currency)} → ${formatMovementAmount(movement.destinationAmount, movement.currency === 'USD' ? 'UYU' : 'USD')}`
    : getMovementSubtitleParts(movement).join(' · ')
  const signedTotal = type === 'EXPENSE' || type === 'CARD_PAYMENT' ? -Math.abs(movement.total) : type === 'INCOME' ? Math.abs(movement.total) : movement.total
  const amount = type === 'FX' && movement.sourceAmount != null && movement.destinationAmount != null
    ? `${formatMovementAmount(movement.sourceAmount, movement.currency)} → ${formatMovementAmount(movement.destinationAmount, movement.currency === 'USD' ? 'UYU' : 'USD')}`
    : formatMovementAmount(signedTotal, movement.currency)
  return <button type="button" onClick={() => onClick(movement)} className="group flex w-full items-center gap-3 border-b border-border/60 py-3.5 text-left transition hover:bg-surface/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25">
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-soft ${tone}`}><Icon className="h-[18px] w-[18px]" strokeWidth={1.8} /></span>
    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-foreground">{title}</span><span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{subtitle || 'Sin detalles adicionales'}</span></span>
    <span className="flex max-w-[45%] shrink-0 items-center gap-1"><span className={`text-right text-sm font-bold tabular-nums ${tone}`}>{amount}</span><ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/35 transition group-hover:translate-x-0.5" /></span>
  </button>
}
