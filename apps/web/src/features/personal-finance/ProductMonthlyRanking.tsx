'use client'

import React, { useMemo, useState } from 'react'
import { PackageOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCurrency } from './constants'
import type { PersonalExpenseItem } from './types'

interface ProductRankingItemExtended {
  name: string
  normalizedName: string
  count: number
  totalQuantity: number
  totalSpent: number
  isWeight: boolean
}

interface ProductMonthlyRankingProps {
  items: PersonalExpenseItem[]
}

type SortBy = 'totalSpent' | 'count'

const PAGE_SIZES = [5, 10, 25, 50]

function computeRanking(items: PersonalExpenseItem[], sortBy: SortBy): ProductRankingItemExtended[] {
  if (!items?.length) return []

  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\b\d+(?:g|gr|grs|kg|kgs|ml|l|cc|u|un|und|unid)\b/g, '')
      .trim()
      .replace(/\s+/g, ' ')
  }

  // Step 1: Initial exact grouping of normalized names
  type RawAcc = Record<string, { originalName: string; count: number; totalQuantity: number; totalSpent: number; isWeight: boolean }>
  const rawGrouped = items.reduce<RawAcc>((acc, item) => {
    const clean = normalizeString(item.name)
    if (!clean) return acc
    if (!acc[clean]) {
      acc[clean] = { originalName: item.name, count: 0, totalQuantity: 0, totalSpent: 0, isWeight: false }
    }
    acc[clean].count += 1
    const qty = item.quantity ?? 1
    acc[clean].totalQuantity += qty
    acc[clean].totalSpent += item.totalPrice
    
    // If quantity is decimal or less than 1, it's sold by weight
    if (item.quantity !== null && (item.quantity % 1 !== 0 || item.quantity < 0.999)) {
      acc[clean].isWeight = true
    }
    return acc
  }, {})

  // Step 2: Merge subsets (e.g. "jamon dona coca et negra" into "jamon dona coca")
  const sortedKeys = Object.keys(rawGrouped).sort((a, b) => a.length - b.length)
  const finalGrouped: Record<string, ProductRankingItemExtended> = {}

  for (const key of sortedKeys) {
    const data = rawGrouped[key]
    if (!data) continue
    let merged = false

    for (const existingKey of Object.keys(finalGrouped)) {
      const existingWords = existingKey.split(' ')
      const currentWords = key.split(' ')
      
      const allWordsMatch = existingWords.every((word) => currentWords.includes(word))

      if (allWordsMatch && existingWords.length > 1) {
        const existing = finalGrouped[existingKey]
        if (existing) {
          existing.count += data.count
          existing.totalQuantity += data.totalQuantity
          existing.totalSpent += data.totalSpent
          if (data.isWeight) existing.isWeight = true
          merged = true
          break
        }
      }
    }

    if (!merged) {
      finalGrouped[key] = {
        name: data.originalName.toLowerCase().trim(), // Normalize completely to lowercase
        normalizedName: key,
        count: data.count,
        totalQuantity: data.totalQuantity,
        totalSpent: data.totalSpent,
        isWeight: data.isWeight
      }
    }
  }

  return Object.values(finalGrouped)
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
                <p className="truncate text-sm font-semibold text-foreground lowercase">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {item.count} {item.count === 1 ? 'compra' : 'compras'} · {item.isWeight ? `${item.totalQuantity.toFixed(3)} kg` : `${item.totalQuantity} u`}
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
