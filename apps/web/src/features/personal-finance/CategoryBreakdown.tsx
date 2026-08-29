'use client'

import React from 'react'
import { CATEGORY_LABELS, formatCurrency } from './constants'

interface CategoryBreakdownProps {
  byCategory: Record<string, number>
  total: number
}

const CATEGORY_COLORS: Record<string, string> = {
  supermercado: 'bg-cat-super',
  alimentos: 'bg-cat-super',
  limpieza: 'bg-cat-super',
  higiene: 'bg-cat-hygiene',
  snacks: 'bg-cat-snacks',
  delivery: 'bg-cat-delivery',
  transporte: 'bg-cat-fuel',
  combustible: 'bg-cat-fuel',
  alquiler: 'bg-cat-home',
  gastos_comunes: 'bg-cat-home',
  internet: 'bg-cat-delivery',
}

export default function CategoryBreakdown({ byCategory, total }: CategoryBreakdownProps) {
  const entries = Object.entries(byCategory).sort(([, a], [, b]) => b - a)

  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-xs text-muted-foreground bg-transparent">
        Sin gastos registrados este mes
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {entries.map(([key, amount]) => {
        const pct = total > 0 ? (amount / total) * 100 : 0
        const barColor = CATEGORY_COLORS[key.toLowerCase()] ?? 'bg-primary'

        return (
          <div key={key} className="flex flex-col gap-1 py-1">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-foreground truncate max-w-[180px]">
                {CATEGORY_LABELS[key] ?? key}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-[11px] tabular-nums">
                  {pct.toFixed(0)}%
                </span>
                <span className="text-foreground font-bold tabular-nums">
                  {formatCurrency(amount)}
                </span>
              </div>
            </div>

            {/* Barra fina */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/40">
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-500`}
                style={{ width: `${Math.max(pct, 2)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
