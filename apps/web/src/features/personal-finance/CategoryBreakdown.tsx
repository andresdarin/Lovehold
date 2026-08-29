'use client'

import { CATEGORY_LABELS } from './constants'

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
  alquiler: 'bg-cat-home',
  gastos_comunes: 'bg-cat-home',
  internet: 'bg-cat-delivery',
}

export default function CategoryBreakdown({ byCategory, total }: CategoryBreakdownProps) {
  const entries = Object.entries(byCategory).sort(([, a], [, b]) => b - a)

  if (entries.length === 0) {
    return <p className="py-6 text-center text-xs text-muted-foreground bg-transparent">Sin datos este mes</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map(([key, amount]) => {
        const pct = total > 0 ? (amount / total) * 100 : 0
        const barColor = CATEGORY_COLORS[key.toLowerCase()] ?? 'bg-primary'
        return (
          <div key={key} className="flex items-center gap-3 py-1 bg-transparent">
            {/* Nombre de categoría */}
            <span className="w-28 shrink-0 truncate text-xs font-semibold text-foreground">
              {CATEGORY_LABELS[key] ?? key}
            </span>

            {/* Barra de progreso en el centro */}
            <div className="flex-1 h-2 bg-surface-soft rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full transition-all duration-500`}
                style={{ width: `${Math.max(pct, 1)}%` }}
              />
            </div>

            {/* Porcentaje a la derecha */}
            <span className="w-10 shrink-0 text-right text-xs text-muted-foreground font-bold tabular-nums">
              {pct.toFixed(0)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}
