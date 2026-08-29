'use client'

import React from 'react'
import { formatCurrency } from './constants'
import type { MonthlySummary } from './types'

interface MonthlySummaryCardsProps {
  summary: MonthlySummary
}

export default function MonthlySummaryCards({ summary }: MonthlySummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Total Gastado - Tarjeta Principal */}
      <div className="col-span-2 rounded-3xl border border-border bg-surface p-6 shadow-xs flex flex-col gap-1 relative overflow-hidden">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Gastado</span>
        <span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
          {formatCurrency(summary.total)}
        </span>
      </div>

      {/* Gastos Fijos */}
      <div className="col-span-1 rounded-2xl border border-border bg-surface p-4 shadow-xs flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted-foreground">Gastos Fijos</span>
        <span className="text-lg font-bold text-foreground tabular-nums">
          {formatCurrency(summary.fixed)}
        </span>
      </div>

      {/* Supermercado */}
      <div className="col-span-1 rounded-2xl border border-border bg-surface p-4 shadow-xs flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted-foreground">Supermercado</span>
        <span className="text-lg font-bold text-foreground tabular-nums">
          {formatCurrency(summary.supermarket)}
        </span>
      </div>

      {/* Otros Variables */}
      <div className="col-span-2 rounded-2xl border border-border bg-surface p-4 shadow-xs flex flex-col gap-1">
        <span className="text-xs font-semibold text-muted-foreground">Otros Variables</span>
        <span className="text-lg font-bold text-foreground tabular-nums">
          {formatCurrency(summary.variable)}
        </span>
      </div>
    </div>
  )
}
