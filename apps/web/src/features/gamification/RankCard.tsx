import LiquidGlass from '@/components/ui/LiquidGlass'
import { RankShield } from './RankShield'
import { RankProgressBar } from './RankProgressBar'
import type { GamificationProfile } from './ranks.types'

interface RankCardProps {
  profile: GamificationProfile
}

export function RankCard({ profile }: RankCardProps) {
  const { currentRank, nextRank, totalXp, progress } = profile
  const isMaxRank = !nextRank

  return (
    <LiquidGlass variant="card" intensity="medium">
      <div className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
        <RankShield
          tier={currentRank.tier}
          division={currentRank.division}
          colorLabel={currentRank.colorLabel}
          size={80}
        />

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-foreground">{currentRank.name}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{currentRank.description}</p>

          <div className="mt-3 space-y-1.5">
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground font-semibold">{totalXp.toLocaleString('es-UY')}</span> XP total
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
        </div>
      </div>
    </LiquidGlass>
  )
}
