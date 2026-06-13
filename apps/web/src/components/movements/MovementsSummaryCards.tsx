'use client'

import { money } from '../expenses/constants'
import type { MonthSummary } from './types'

interface Props {
  summary: MonthSummary | null
  loading: boolean
}

interface CardData {
  label: string
  value: number
}

export default function MovementsSummaryCards({ summary, loading }: Props) {
  const cards: CardData[] = summary
    ? [
        { label: 'Total gastado', value: summary.totalSpent },
        { label: 'Gastos fijos', value: summary.fixedTotal },
        { label: 'Supermercado', value: summary.supermarketTotal },
        { label: 'Variables', value: summary.variableTotal },
      ]
    : []

  if (loading && !summary) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-border bg-surface p-4">
            <div className="h-3 w-20 rounded-lg bg-surface-soft" />
            <div className="mt-2 h-6 w-28 rounded-lg bg-surface-soft" />
          </div>
        ))}
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
          <p className="mt-1 text-lg font-bold text-foreground">{money(card.value)}</p>
        </div>
      ))}
    </div>
  )
}
