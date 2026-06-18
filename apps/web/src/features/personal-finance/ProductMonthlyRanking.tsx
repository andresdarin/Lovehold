'use client'

import React, { useMemo, useState } from 'react'
import { PackageOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency } from './constants'
import type { PersonalExpenseItem, ProductRankingItem } from './types'

interface ProductMonthlyRankingProps {
  items: PersonalExpenseItem[]
}

type SortBy = 'totalSpent' | 'count'

const PAGE_SIZES = [5, 10, 25, 50]

function computeRanking(items: PersonalExpenseItem[], sortBy: SortBy): ProductRankingItem[] {
  if (!items?.length) return []

  const grouped: Record<string, ProductRankingItem> = {}

  for (const item of items) {
    const key = item.name.toLowerCase().trim().replace(/\s+/g, ' ')
    if (!grouped[key]) {
      grouped[key] = { name: item.name, normalizedName: key, count: 0, totalQuantity: 0, totalSpent: 0 }
    }
    grouped[key].count += 1
    grouped[key].totalQuantity += item.quantity ?? 1
    grouped[key].totalSpent += item.totalPrice
  }

  return Object.values(grouped)
    .map((g) => ({ ...g, totalSpent: Math.round(g.totalSpent * 100) / 100 }))
    .sort((a, b) => (sortBy === 'count' ? b.count - a.count : b.totalSpent - a.totalSpent))
}

export default function ProductMonthlyRanking({ items }: ProductMonthlyRankingProps) {
  const [sortBy, setSortBy] = useState<SortBy>('totalSpent')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  const ranking = useMemo(() => computeRanking(items, sortBy), [items, sortBy])
  const totalPages = Math.max(1, Math.ceil(ranking.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginated = ranking.slice((safePage - 1) * pageSize, safePage * pageSize)

  if (ranking.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <PackageOpen className="h-6 w-6 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No hay productos este mes</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as SortBy); setPage(1) }}
            className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45"
          >
            <option value="totalSpent">Mayor gasto</option>
            <option value="count">Más unidades</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Mostrar</span>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
            className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/45"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        {paginated.map((item, i) => {
          const rank = (safePage - 1) * pageSize + i + 1
          return (
            <div key={item.normalizedName} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5 shadow-sm">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-xs font-bold text-muted-foreground">
                {rank}
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
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary/45"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs text-muted-foreground">{safePage} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition hover:bg-surface-soft disabled:cursor-not-allowed disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary/45"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
