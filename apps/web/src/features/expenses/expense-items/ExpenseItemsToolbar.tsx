'use client'

import type { ReactNode } from 'react'
import { Calculator, Plus, Trash2 } from 'lucide-react'
import { money } from '../constants'

function ToolbarButton({
  children, onClick, disabled = false, tone = 'secondary',
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  tone?: 'primary' | 'secondary' | 'danger'
}) {
  const color = tone === 'primary'
    ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90'
    : tone === 'danger'
      ? 'border border-border bg-surface-soft text-muted-foreground hover:bg-muted hover:text-danger'
      : 'border border-border bg-surface-soft text-foreground hover:bg-muted'

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${color}`}
    >
      {children}
    </button>
  )
}

export default function ExpenseItemsToolbar({
  itemsCount, itemsTotal, onAddItem, onUseItemsTotal, onClearItems,
}: {
  itemsCount: number
  itemsTotal: number
  onAddItem: () => void
  onUseItemsTotal: () => void
  onClearItems: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-base font-bold text-foreground">Productos del ticket</h2>
        <span className="text-xs font-medium text-muted-foreground">{itemsCount} total</span>
      </div>

      <div className="flex items-center gap-2">
        <ToolbarButton onClick={onUseItemsTotal} disabled={itemsCount === 0}>
          <Calculator className="h-4 w-4 text-primary" />
          Usar {money(itemsTotal)}
        </ToolbarButton>
        <ToolbarButton onClick={onClearItems} disabled={itemsCount === 0} tone="danger">
          <Trash2 className="h-4 w-4" />
          Eliminar todos
        </ToolbarButton>
        <ToolbarButton onClick={onAddItem} tone="primary">
          <Plus className="h-4 w-4" />
          Agregar producto
        </ToolbarButton>
      </div>
    </div>
  )
}
