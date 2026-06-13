export type RankDivision = 'III' | 'II' | 'I' | null

export type RankTier =
  | 'refugio'
  | 'cimiento'
  | 'muralla'
  | 'torre'
  | 'bastion'
  | 'fortaleza'
  | 'ciudadela'
  | 'santuario'
  | 'custodio'
  | 'centinela'
  | 'regente'
  | 'lovehold'

export interface RankConfig {
  key: string
  name: string
  tier: RankTier
  division: RankDivision
  minXp: number
  colorLabel: string
  description: string
}

export interface GamificationProfile {
  totalXp: number
  currentRank: RankConfig
  nextRank: RankConfig | null
  progress: {
    currentXpInRank: number
    requiredXpForNextRank: number
    percent: number
    xpRemaining: number
  }
}
