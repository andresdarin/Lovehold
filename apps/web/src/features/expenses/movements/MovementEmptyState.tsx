'use client'
import { Inbox } from 'lucide-react'
interface Props { hasFilters?: boolean; onClearFilters?: () => void }
export default function MovementEmptyState({ hasFilters, onClearFilters }: Props) {
  return <div className="flex flex-col items-center px-6 py-16 text-center"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-soft"><Inbox className="h-6 w-6 text-muted-foreground" /></div><h3 className="mt-4 text-base font-bold text-foreground">{hasFilters ? 'Sin resultados' : 'No hay movimientos todavía'}</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">{hasFilters ? 'No hay movimientos con estos filtros.' : 'Tus ingresos, egresos y transferencias aparecerán acá.'}</p>{hasFilters && <button type="button" onClick={onClearFilters} className="mt-5 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-surface-soft">Limpiar filtros</button>}</div>
}
