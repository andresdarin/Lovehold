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
      <div className="col-span-2 rounded-xl border border-primary/60 bg-surface p-4 flex flex-col gap-1">
        <span className="text-[12px] font-normal text-muted-foreground">Total Gastado</span>
        <span className="text-2xl font-medium text-foreground">
          {formatCurrency(summary.total)}
        </span>
      </div>

      {/* Gastos Fijos */}
      <div className="col-span-1 rounded-xl border border-border bg-surface p-4 flex flex-col gap-1">
        <span className="text-[12px] font-normal text-muted-foreground">Gastos Fijos</span>
        <span className="text-xl font-medium text-foreground">
          {formatCurrency(summary.fixed)}
        </span>
      </div>

      {/* Supermercado */}
      <div className="col-span-1 rounded-xl border border-border bg-surface p-4 flex flex-col gap-1">
        <span className="text-[12px] font-normal text-muted-foreground">Supermercado</span>
        <span className="text-xl font-medium text-foreground">
          {formatCurrency(summary.supermarket)}
        </span>
      </div>

      {/* Otros Variables */}
      <div className="col-span-2 rounded-xl border border-border bg-surface p-4 flex flex-col gap-1">
        <span className="text-[12px] font-normal text-muted-foreground">Otros Variables</span>
        <span className="text-xl font-medium text-foreground">
          {formatCurrency(summary.variable)}
        </span>
      </div>
    </div>
  )
}
