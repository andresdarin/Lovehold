'use client'

import { RotateCcw } from 'lucide-react'
import { formatAmount, getMovementMetadata } from './utils'
import MovementKindChip from './MovementKindChip'
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
      className="flex w-full items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 text-left shadow-sm transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {movement.title || movement.merchant || 'Sin título'}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {getMovementMetadata(movement)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <MovementKindChip kind={movement.kind} compact />
          {movement.isRecurring && (
            <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
              <RotateCcw className="h-3 w-3" />
              {movement.recurringLabel || 'Recurrente'}
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-base font-bold text-foreground">{formatAmount(movement.total)}</p>
        {movement.paymentMethod && (
          <p className="mt-0.5 text-[11px] text-muted-foreground">{movement.paymentMethod}</p>
        )}
      </div>
    </button>
  )
}
