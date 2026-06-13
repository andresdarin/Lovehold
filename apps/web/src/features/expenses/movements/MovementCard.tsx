'use client'

import { ChevronRight } from 'lucide-react'
import { formatAmount, getMovementDisplayTitle, getMovementSubtitleParts } from './utils'
import MovementKindChip from './MovementKindChip'
import type { Movement } from './types'

interface Props {
  movement: Movement
  onClick: (m: Movement) => void
}

export default function MovementCard({ movement, onClick }: Props) {
  const title = getMovementDisplayTitle(movement)
  const subtitleParts = getMovementSubtitleParts(movement)
  const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' · ') : null

  return (
    <button
      type="button"
      onClick={() => onClick(movement)}
      className="group flex w-full items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3 text-left shadow-sm transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{title}</p>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
        <div className="mt-1.5 flex items-center gap-1.5">
          <MovementKindChip kind={movement.kind} />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <div className="text-right">
          <p className="text-sm font-bold text-foreground tabular-nums">{formatAmount(movement.total)}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/40 transition group-hover:text-muted-foreground/70" />
      </div>
    </button>
  )
}
