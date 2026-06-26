'use client'

import React, { useState } from 'react'
import { ShoppingCart, Zap, Home, Tag, Receipt } from 'lucide-react'
import { formatCurrency, formatDate, CATEGORY_LABELS } from './constants'
import type { PersonalExpense } from './types'

interface RecentExpensesListProps {
  expenses: PersonalExpense[]
}

function getCategoryIcon(category: string) {
  const cat = category.toLowerCase()
  if (cat === 'supermercado' || cat === 'supermarket') {
    return <ShoppingCart className="h-4 w-4" />
  }
  if (['ute', 'ose', 'antel', 'internet', 'gastos_comunes', 'servicios', 'services', 'salud'].includes(cat)) {
    return <Zap className="h-4 w-4" />
  }
  if (cat === 'alquiler' || cat === 'rental') {
    return <Home className="h-4 w-4" />
  }
  return <Tag className="h-4 w-4" />
}

export default function RecentExpensesList({ expenses }: RecentExpensesListProps) {
  const [showAll, setShowAll] = useState(false)

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center bg-transparent">
        <Receipt className="h-8 w-8 text-muted-foreground/45" />
        <p className="text-xs text-muted-foreground">No hay gastos este mes</p>
      </div>
    )
  }

  const displayedExpenses = showAll ? expenses : expenses.slice(0, 10)

  return (
    <div className="flex flex-col gap-3">
      {displayedExpenses.map((exp) => (
        <div 
          key={exp.id} 
          className="flex items-center gap-3 bg-transparent pb-3 border-b-[0.5px] border-border/50 last:border-b-0 last:pb-0"
        >
          {/* Círculo pequeño de 32px */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface-soft text-foreground/80">
            {getCategoryIcon(exp.category)}
          </div>

          {/* Columna central */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {exp.merchant || exp.title}
            </p>
            <p className="truncate text-xs text-muted-foreground mt-0.5">
              {CATEGORY_LABELS[exp.category] ?? exp.category} · {formatDate(exp.date)}
            </p>
          </div>

          {/* Monto a la derecha */}
          <p className="shrink-0 text-sm font-medium text-primary">
            {formatCurrency(exp.amount)}
          </p>
        </div>
      ))}

      {expenses.length > 10 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full text-center py-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none"
        >
          Ver más
        </button>
      )}
    </div>
  )
}
