'use client'

import React from 'react'
import { PackageOpen } from 'lucide-react'
import { formatCurrency } from './constants'
import type { ProductRankingItem } from './types'

interface ProductMonthlyRankingProps {
  ranking: ProductRankingItem[]
}

export default function ProductMonthlyRanking({ ranking }: ProductMonthlyRankingProps) {
  if (ranking.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <PackageOpen className="h-6 w-6 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No hay productos este mes</p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {ranking.map((item, i) => (
        <div key={item.normalizedName} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 shadow-sm">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-xs font-bold text-muted-foreground">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">
              {item.count} compra{item.count !== 1 ? 's' : ''}
              {item.totalQuantity > 0 ? ` · ${item.totalQuantity} unidad${item.totalQuantity !== 1 ? 'es' : ''}` : ''}
            </p>
          </div>
          <p className="shrink-0 text-sm font-bold text-foreground">{formatCurrency(item.totalSpent)}</p>
        </div>
      ))}
    </div>
  )
}
