import { RANKS } from './ranks.constants'
import type { RankConfig, GamificationProfile } from './ranks.types'

export function getCurrentRank(totalXp: number): RankConfig {
  const safeXp = Math.max(0, totalXp)
  let current = RANKS[0]!
  for (const rank of RANKS) {
    if (rank.minXp <= safeXp) {
      current = rank
    }
  }
  return current
}

export function getNextRank(totalXp: number): RankConfig | null {
  const safeXp = Math.max(0, totalXp)
  const current = getCurrentRank(safeXp)
  const currentIndex = RANKS.indexOf(current)
  if (currentIndex >= RANKS.length - 1) {
    return null
  }
  return RANKS[currentIndex + 1] ?? null
}

export function getRankProgress(totalXp: number) {
  const safeXp = Math.max(0, totalXp)
  const current = getCurrentRank(safeXp)
  const next = getNextRank(safeXp)

  if (!next) {
    return {
      currentXpInRank: 0,
      requiredXpForNextRank: 0,
      percent: 100,
      xpRemaining: 0,
    }
  }

  const xpInCurrentRank = safeXp - current.minXp
  const xpRange = next.minXp - current.minXp
  const percent = xpRange > 0 ? Math.min(100, Math.round((xpInCurrentRank / xpRange) * 100)) : 100
  const xpRemaining = next.minXp - safeXp

  return {
    currentXpInRank: xpInCurrentRank,
    requiredXpForNextRank: xpRange,
    percent,
    xpRemaining: Math.max(0, xpRemaining),
  }
}

export function buildRankProfile(totalXp: number): GamificationProfile {
  const currentRank = getCurrentRank(totalXp)
  const nextRank = getNextRank(totalXp)
  const progress = getRankProgress(totalXp)
  return { totalXp, currentRank, nextRank, progress }
}
