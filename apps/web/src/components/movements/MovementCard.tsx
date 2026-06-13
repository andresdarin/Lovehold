'use client'

import { RotateCcw } from 'lucide-react'
import { money } from '../expenses/constants'
import { kindLabel, kindColor, scopeLabel } from './utils'
import type { Movement } from './types'

interface Props {
  movement: Movement
  onClick: (m: Movement) => void
}

export default function MovementCard({ movement, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={() => onClick(movement)}
      className="w-full rounded-2xl border border-border bg-surface p-4 text-left shadow-sm transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {movement.title || movement.merchant || 'Sin título'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {movement.merchant && movement.title ? movement.merchant : null}
            {movement.paymentMethod && (
              <span className="text-muted-foreground">{movement.merchant && movement.title ? ' · ' : ''}{movement.paymentMethod}</span>
            )}
          </p>
        </div>
        <p className="shrink-0 text-base font-bold text-foreground">{money(movement.total)}</p>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
          {movement.category}
        </span>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${kindColor(movement.kind)}`}>
          {kindLabel(movement.kind)}
        </span>
        <span className="rounded-full bg-surface-soft px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {scopeLabel(movement.scope)}
        </span>
        {movement.itemsCount > 0 && (
          <span className="text-[11px] text-muted-foreground">
            {movement.itemsCount} producto{movement.itemsCount !== 1 ? 's' : ''}
          </span>
        )}
        {movement.isRecurring && (
          <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
            <RotateCcw className="h-3 w-3" />
            {movement.recurringLabel || 'Recurrente'}
          </span>
        )}
      </div>
    </button>
  )
}
