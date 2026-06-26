'use client'

import { CATEGORY_LABELS } from './constants'

interface CategoryBreakdownProps {
  byCategory: Record<string, number>
  total: number
}



export default function CategoryBreakdown({ byCategory, total }: CategoryBreakdownProps) {
  const entries = Object.entries(byCategory).sort(([, a], [, b]) => b - a)

  if (entries.length === 0) {
    return <p className="py-6 text-center text-xs text-muted-foreground bg-transparent">Sin datos este mes</p>
  }

  return (
    <div className="flex flex-col gap-1">
      {entries.map(([key, amount]) => {
        const pct = total > 0 ? (amount / total) * 100 : 0
        return (
          <div key={key} className="flex items-center gap-3 py-1.5 bg-transparent">
            {/* Nombre de categoría */}
            <span className="w-24 shrink-0 truncate text-sm font-medium text-foreground">
              {CATEGORY_LABELS[key] ?? key}
            </span>

            {/* Barra de progreso en el centro */}
            <div className="flex-1 h-1 bg-surface-soft rounded-[2px] overflow-hidden">
              <div
                className="h-full bg-primary rounded-[2px] transition-all duration-500"
                style={{ width: `${Math.max(pct, 0.5)}%` }}
              />
            </div>

            {/* Porcentaje a la derecha */}
            <span className="w-10 shrink-0 text-right text-xs text-muted-foreground font-medium">
              {pct.toFixed(0)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
