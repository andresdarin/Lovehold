'use client'

import React from 'react'
import { formatCurrency, CATEGORY_LABELS } from './constants'

interface CategoryBreakdownProps {
  byCategory: Record<string, number>
  total: number
}

const CATEGORY_COLORS: Record<string, string> = {
  alquiler: 'bg-blue-500', ute: 'bg-cyan-500', ose: 'bg-teal-500',
  antel: 'bg-sky-500', internet: 'bg-indigo-500', gastos_comunes: 'bg-violet-500',
  otros_fijos: 'bg-slate-500', delivery: 'bg-orange-500', transporte: 'bg-yellow-500',
  salud: 'bg-red-500', ocio: 'bg-pink-500', mascotas: 'bg-rose-500',
  compras: 'bg-purple-500', otros_variables: 'bg-stone-500',
  supermercado: 'bg-emerald-500',
}

export default function CategoryBreakdown({ byCategory, total }: CategoryBreakdownProps) {
  const entries = Object.entries(byCategory).sort(([, a], [, b]) => b - a)

  if (entries.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Sin datos este mes</p>
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, amount]) => {
        const pct = total > 0 ? (amount / total) * 100 : 0
        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{CATEGORY_LABELS[key] ?? key}</span>
              <span className="text-muted-foreground">{formatCurrency(amount)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-soft">
              <div
                className={`h-full rounded-full transition-all duration-500 ${CATEGORY_COLORS[key] ?? 'bg-primary'}`}
                style={{ width: `${Math.max(pct, 1)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
