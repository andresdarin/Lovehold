'use client'

import React from 'react'
import { BadgeDollarSign, ShoppingCart, Receipt } from 'lucide-react'
import { formatCurrency, formatDate, CATEGORY_LABELS } from './constants'
import type { PersonalExpense } from './types'

interface RecentExpensesListProps {
  expenses: PersonalExpense[]
}

const typeIcons: Record<string, React.ReactNode> = {
  fixed: <Receipt className="h-4 w-4" />,
  variable: <BadgeDollarSign className="h-4 w-4" />,
  supermarket: <ShoppingCart className="h-4 w-4" />,
}

const typeColors: Record<string, string> = {
  fixed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  variable: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  supermarket: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
}

export default function RecentExpensesList({ expenses }: RecentExpensesListProps) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <Receipt className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No hay gastos este mes</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {expenses.map((exp) => (
        <div key={exp.id} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm transition hover:bg-surface-soft">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${typeColors[exp.type] ?? 'bg-surface-soft text-muted-foreground'}`}>
            {typeIcons[exp.type]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{exp.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {CATEGORY_LABELS[exp.category] ?? exp.category}
              {exp.merchant ? ` · ${exp.merchant}` : ''}
              {' · '}{formatDate(exp.date)}
            </p>
          </div>
          <p className="shrink-0 text-sm font-bold text-foreground">{formatCurrency(exp.amount)}</p>
        </div>
      ))}
    </div>
  )
}
