'use client'

import { Search, X } from 'lucide-react'
import type { MovementFilters } from './types'
import { KIND_OPTIONS, SCOPE_OPTIONS } from './constants'

interface Props {
  filters: MovementFilters
  onChange: (key: keyof MovementFilters, value: string) => void
  onClear: () => void
}

const inputBase = 'h-11 rounded-xl border border-border bg-surface-soft text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'
const inputSelect = `${inputBase} appearance-none px-4 font-medium`
const inputText = `${inputBase} px-4`

export default function MovementsFilters({ filters, onChange, onClear }: Props) {
  const hasActiveFilters = filters.q || filters.kind || filters.scope || filters.category || filters.paymentMethod

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={filters.q}
          onChange={(e) => onChange('q', e.target.value)}
          placeholder="Buscar…"
          className={`${inputText} w-full pl-10`}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto sm:flex-none">
        <input
          type="month"
          value={filters.month}
          onChange={(e) => onChange('month', e.target.value)}
          className={`${inputText} w-40 shrink-0`}
        />

        <select
          value={filters.kind}
          onChange={(e) => onChange('kind', e.target.value)}
          className={`${inputSelect} w-36 shrink-0`}
        >
          {KIND_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        <select
          value={filters.scope}
          onChange={(e) => onChange('scope', e.target.value)}
          className={`${inputSelect} w-32 shrink-0`}
        >
          {SCOPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-surface-soft px-4 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Limpiar</span>
          </button>
        )}
      </div>
    </div>
  )
}
