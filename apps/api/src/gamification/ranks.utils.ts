import { RANKS } from './ranks.constants'
import type { RankConfig, GamificationProfileResponse } from './gamification.types'

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
  const next = RANKS[currentIndex + 1]
  return next ?? null
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

export function getRankProgressPercent(totalXp: number): number {
  return getRankProgress(totalXp).percent
}

export function getXpToNextRank(totalXp: number): number {
  return getRankProgress(totalXp).xpRemaining
}

export function getRankDisplayName(rank: RankConfig): string {
  return rank.name
}

export function getRankTone(rank: RankConfig): string {
  return rank.colorLabel
}

export function getRankShieldVariant(rank: RankConfig): string {
  return rank.tier
}

export function buildGamificationProfile(totalXp: number): GamificationProfileResponse {
  const currentRank = getCurrentRank(totalXp)
  const nextRank = getNextRank(totalXp)
  const progress = getRankProgress(totalXp)

  return {
    totalXp,
    currentRank,
    nextRank,
    progress,
  }
}
