'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import MovementsMonthPicker from './MovementsMonthPicker'
import type { MovementFilters } from './types'

interface Props {
  filters: MovementFilters
  onChange: (key: keyof MovementFilters, value: string) => void
  onClear: () => void
}

const selectClass = 'h-10 shrink-0 appearance-none rounded-2xl border border-border/60 bg-surface px-4 text-xs font-semibold text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'

export default function MovementsFilters({ filters, onChange, onClear }: Props) {
  const [open, setOpen] = useState(false)
  const active = Boolean(filters.financialType || filters.account || filters.category || filters.currency || filters.period)
  return (
    <section className="space-y-3" aria-label="Buscar y filtrar movimientos">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={filters.q} onChange={(e) => onChange('q', e.target.value)} placeholder="Buscar movimientos..."
          className="h-12 w-full rounded-2xl border border-border/60 bg-surface pl-11 pr-4 text-sm text-foreground shadow-xs outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15" />
      </div>
      <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
        <MovementsMonthPicker value={filters.month} onChange={(v) => onChange('month', v)} />
        <select aria-label="Tipo de movimiento" value={filters.financialType} onChange={(e) => onChange('financialType', e.target.value)} className={selectClass}>
          <option value="">Todos</option><option value="INCOME">Ingresos</option><option value="EXPENSE">Egresos</option><option value="TRANSFER">Transferencias</option><option value="FX">Cambios de moneda</option>
        </select>
        <button type="button" onClick={() => setOpen(true)} className={`${selectClass} ${filters.account ? 'border-primary/50 text-primary' : ''}`}>{filters.account || 'Cuenta'}</button>
        <button type="button" onClick={() => setOpen(true)} className={`${selectClass} flex items-center gap-2 ${active ? 'border-primary/50 text-primary' : ''}`}>
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filtros{active ? ' ·' : ''}
        </button>
      </div>
      {active && <button type="button" onClick={onClear} className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /> Limpiar filtros</button>}
      {open && <FilterSheet filters={filters} onChange={onChange} onClear={onClear} onClose={() => setOpen(false)} />}
    </section>
  )
}

function FilterSheet({ filters, onChange, onClear, onClose }: Props & { onClose: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#071D27]/45 p-0 sm:items-center sm:p-6" onClick={onClose}>
    <div role="dialog" aria-modal="true" aria-label="Filtros de movimientos" onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-t-3xl border border-border bg-surface p-6 shadow-2xl sm:rounded-3xl">
      <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold text-foreground">Filtrar movimientos</h2><button type="button" aria-label="Cerrar" onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-surface-soft"><X className="h-4 w-4" /></button></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-xs font-semibold text-muted-foreground">Cuenta<input value={filters.account} onChange={(e) => onChange('account', e.target.value)} placeholder="Todas" className="mt-1 h-11 w-full rounded-xl border border-border bg-surface-soft px-3 text-sm text-foreground outline-none focus:border-primary" /></label>
        <label className="text-xs font-semibold text-muted-foreground">Categoría<input value={filters.category} onChange={(e) => onChange('category', e.target.value)} placeholder="Todas" className="mt-1 h-11 w-full rounded-xl border border-border bg-surface-soft px-3 text-sm text-foreground outline-none focus:border-primary" /></label>
        <label className="text-xs font-semibold text-muted-foreground">Moneda<select value={filters.currency} onChange={(e) => onChange('currency', e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border bg-surface-soft px-3 text-sm text-foreground outline-none"><option value="">Todas</option><option value="UYU">UYU</option><option value="USD">USD</option></select></label>
        <label className="text-xs font-semibold text-muted-foreground">Período<input type="date" value={filters.period} onChange={(e) => onChange('period', e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-border bg-surface-soft px-3 text-sm text-foreground outline-none" /></label>
      </div>
      <button type="button" onClick={() => { onClear(); onClose() }} className="mt-6 w-full rounded-2xl border border-border px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-surface-soft">Limpiar y cerrar</button>
    </div>
  </div>
}
