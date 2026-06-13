'use client'

import { useState } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useMovements } from './hooks'
import MovementsHeader from './MovementsHeader'
import MovementsSummaryCards from './MovementsSummaryCards'
import MovementsFilters from './MovementsFilters'
import MovementsList from './MovementsList'
import MovementDetailDrawer from './MovementDetailDrawer'
import type { Movement } from './types'

export default function MovementsPageClient() {
  const { movements, summary, pagination, loading, error, filters, setFilter, clearFilters, refresh, loadMore } = useMovements()
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null)

  const hasFilters = !!(
    filters.q || filters.kind || filters.scope || filters.category || filters.paymentMethod
  )

  return (
    <div className="space-y-6">
      <MovementsHeader />
      <MovementsSummaryCards summary={summary} loading={loading} />
      <MovementsFilters filters={filters} onChange={setFilter} onClear={clearFilters} />

      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={refresh}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-danger/30 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/30">
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        </div>
      )}

      <MovementsList
        movements={movements}
        loading={loading}
        hasMore={pagination.hasMore}
        hasFilters={hasFilters}
        onLoadMore={loadMore}
        onMovementClick={setSelectedMovement}
        onClearFilters={clearFilters}
      />

      <MovementDetailDrawer movement={selectedMovement} onClose={() => setSelectedMovement(null)} />
    </div>
  )
}
