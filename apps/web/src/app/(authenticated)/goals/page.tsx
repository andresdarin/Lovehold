'use client'

import { Target, AlertCircle, RefreshCw } from 'lucide-react'
import { useGamification } from '@/features/gamification/hooks'
import { RankCard } from '@/features/gamification/RankCard'
import { RankRoadmap } from '@/features/gamification/RankRoadmap'
import { EarnXpHints } from '@/features/gamification/EarnXpHints'

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-2xl bg-white/10" />
        <div className="space-y-1">
          <div className="h-5 w-24 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-44 animate-pulse rounded bg-white/5" />
        </div>
      </header>
      <div className="h-32 animate-pulse rounded-2xl bg-white/5" />
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-12 text-center shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger/10">
        <AlertCircle className="h-6 w-6 text-danger" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
      >
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </button>
    </div>
  )
}

export default function GoalsPage() {
  const { data, loading, error, refetch } = useGamification()

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorState message={error} onRetry={refetch} />
  if (!data) return <ErrorState message="No se pudieron cargar los datos." onRetry={refetch} />

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
          <Target className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Metas</h1>
          <p className="text-sm text-muted-foreground">Tu progreso financiero y hábitos de registro.</p>
        </div>
      </header>

      <RankCard profile={data} />
      <EarnXpHints />
      <RankRoadmap profile={data} />
    </div>
  )
}
