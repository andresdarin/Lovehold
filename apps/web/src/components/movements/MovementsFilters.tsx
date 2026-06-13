'use client'

import { Search, X } from 'lucide-react'
import type { MovementFilters } from './types'
import { KIND_OPTIONS, SCOPE_OPTIONS } from './types'

interface Props {
  filters: MovementFilters
  onChange: (key: keyof MovementFilters, value: string) => void
  onClear: () => void
}

const inputClass = 'h-11 w-full rounded-xl border border-border bg-surface-soft px-4 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

export default function MovementsFilters({ filters, onChange, onClear }: Props) {
  const hasActiveFilters = filters.q || filters.kind || filters.scope || filters.category || filters.paymentMethod

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="relative sm:w-56">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={filters.q}
          onChange={(e) => onChange('q', e.target.value)}
          placeholder="Buscar…"
          className={`${inputClass} pl-10`}
        />
      </div>

      <input
        type="month"
        value={filters.month}
        onChange={(e) => onChange('month', e.target.value)}
        className={`${inputClass} sm:w-40`}
      />

      <select
        value={filters.kind}
        onChange={(e) => onChange('kind', e.target.value)}
        className={`${inputClass} sm:w-36`}
      >
        {KIND_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      <select
        value={filters.scope}
        onChange={(e) => onChange('scope', e.target.value)}
        className={`${inputClass} sm:w-32`}
      >
        {SCOPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="flex h-11 items-center gap-1.5 rounded-xl border border-border bg-surface-soft px-4 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <X className="h-4 w-4" />
          Limpiar
        </button>
      )}
    </div>
  )
}
