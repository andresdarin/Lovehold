'use client'

import React from 'react'
import { formatCurrency } from './constants'
import type { MonthlySummary } from './types'

interface MonthlySummaryCardsProps {
  summary: MonthlySummary
}

const cards = [
  { key: 'total', label: 'Total Gastado', color: 'text-foreground', bg: 'bg-surface' },
  { key: 'fixed', label: 'Gastos Fijos', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/30' },
  { key: 'supermarket', label: 'Supermercado', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  { key: 'variable', label: 'Otros Variables', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
] as const

export default function MonthlySummaryCards({ summary }: MonthlySummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.key} className={`rounded-2xl border border-border ${c.bg} p-4 shadow-sm`}>
          <p className="text-xs font-medium text-muted-foreground">{c.label}</p>
          <p className={`mt-1 text-lg font-bold ${c.color}`}>
            {formatCurrency(summary[c.key as keyof MonthlySummary] as number)}
          </p>
        </div>
      ))}
    </div>
  )
}
