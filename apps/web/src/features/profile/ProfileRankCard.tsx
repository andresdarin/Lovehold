import Link from 'next/link'
import { Target, AlertCircle } from 'lucide-react'
import LiquidGlass from '@/components/ui/LiquidGlass'
import { RankShield } from '@/features/gamification/RankShield'
import { RankProgressBar } from '@/features/gamification/RankProgressBar'
import type { GamificationProfile } from '@/features/gamification/ranks.types'

interface ProfileRankCardProps {
  data: GamificationProfile | null
  loading: boolean
  error: string | null
}

export function ProfileRankCard({ data, loading, error }: ProfileRankCardProps) {
  if (loading) {
    return (
      <LiquidGlass variant="card" intensity="medium" className="p-6">
        <div className="flex items-center gap-4 animate-pulse">
          <div className="h-[72px] w-[72px] rounded-full bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 rounded bg-white/10" />
            <div className="h-3 w-48 rounded bg-white/10" />
            <div className="mt-3 h-2 w-full rounded-full bg-white/10" />
          </div>
        </div>
      </LiquidGlass>
    )
  }

  if (error || !data) {
    return (
      <LiquidGlass variant="card" intensity="medium" className="p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No pudimos cargar tu progreso</p>
        </div>
      </LiquidGlass>
    )
  }

  const { currentRank, nextRank, totalXp, progress } = data
  const isMaxRank = !nextRank

  return (
    <LiquidGlass variant="card" intensity="medium" className="p-6">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <RankShield
          tier={currentRank.tier}
          division={currentRank.division}
          colorLabel={currentRank.colorLabel}
          size={80}
        />

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-foreground">{currentRank.name}</h3>
          <p className="text-sm text-muted-foreground">{currentRank.description}</p>

          <div className="mt-3 space-y-1.5">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{totalXp.toLocaleString('es-UY')}</span> XP total
            </p>

            {isMaxRank ? (
              <p className="text-xs font-medium text-amber-400">Rango máximo alcanzado</p>
            ) : (
              <>
                <RankProgressBar percent={progress.percent} color={currentRank.colorLabel} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {progress.currentXpInRank.toLocaleString('es-UY')} / {progress.requiredXpForNextRank.toLocaleString('es-UY')}
                  </span>
                  <span>
                    {progress.xpRemaining.toLocaleString('es-UY')} XP para {nextRank.name}
                  </span>
                </div>
              </>
            )}
          </div>

          <Link
            href="/goals"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary transition hover:text-primary/80"
          >
            <Target className="h-3.5 w-3.5" />
            Ver metas
          </Link>
        </div>
      </div>
    </LiquidGlass>
  )
}
