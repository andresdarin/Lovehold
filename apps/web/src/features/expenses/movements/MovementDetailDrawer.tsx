'use client'
import { X } from 'lucide-react'
import { formatDate, formatMovementAmount, getMovementDisplayTitle } from './utils'
import type { Movement } from './types'
interface Props { movement: Movement | null; onClose: () => void }
export default function MovementDetailDrawer({ movement, onClose }: Props) {
  if (!movement) return null
  const type = movement.financialType ?? 'EXPENSE'
  const labels: Record<string, string> = { EXPENSE: 'Egreso', INCOME: 'Ingreso', TRANSFER: 'Transferencia', FX: 'Cambio de moneda', CARD_PAYMENT: 'Pago de tarjeta' }
  const fields = [['Tipo', labels[type]], ['Categoría', movement.category], ['Cuenta origen', movement.accountName], ['Cuenta destino', movement.destinationAccountName], ['Medio de pago', movement.paymentMethod], ['Fecha', formatDate(movement.date)], ['Comercio', movement.merchant], ['Ticket asociado', movement.ticketId], ['Tasa histórica', movement.exchangeRate ? `1 USD = ${formatMovementAmount(movement.exchangeRate, 'UYU')}` : null]].filter((field): field is [string, string] => Boolean(field[1]))
  return <><div className="fixed inset-0 z-40 bg-[#071D27]/50" onClick={onClose} /><aside role="dialog" aria-modal="true" aria-label="Detalle del movimiento" className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-3xl border border-border bg-surface shadow-2xl lg:inset-y-0 lg:left-auto lg:right-0 lg:max-h-none lg:w-[420px] lg:rounded-l-3xl lg:rounded-tr-none">
    <div className="flex items-start justify-between gap-4 border-b border-border/70 p-6"><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Detalle</p><h2 className="mt-1 truncate text-xl font-bold text-foreground">{type === 'FX' ? 'Cambio de moneda' : getMovementDisplayTitle(movement)}</h2><p className="mt-1 text-xs text-muted-foreground">{formatDate(movement.date)}</p></div><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full p-2 text-muted-foreground hover:bg-surface-soft"><X className="h-4 w-4" /></button></div>
    <div className="border-b border-border/70 p-6"><p className="text-3xl font-bold tabular-nums text-foreground">{formatMovementAmount(movement.total, movement.currency)}</p>{type === 'FX' && movement.sourceAmount != null && movement.destinationAmount != null && <p className="mt-2 text-sm font-medium text-[#A58D66]">{formatMovementAmount(movement.sourceAmount, movement.currency)} → {formatMovementAmount(movement.destinationAmount, movement.currency === 'USD' ? 'UYU' : 'USD')}</p>}</div>
    <dl className="px-6 py-2">{fields.map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-border/50 py-3 last:border-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="max-w-[62%] truncate text-right text-sm font-semibold text-foreground">{value}</dd></div>)}</dl>
    {movement.notes && <div className="mx-6 mb-6 rounded-2xl bg-surface-soft p-4"><p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Descripción</p><p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{movement.notes}</p></div>}
  </aside></>
}
