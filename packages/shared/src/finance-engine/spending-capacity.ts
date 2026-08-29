import type { SpendingCapacity } from '../schemas/finance'
import { money } from './money'
import { windowDays, type SpendingWindow } from './calendar'
import { protectedCapacity } from './cash-curve'

export const getSpendingCapacity = (snapshot: any, window: SpendingWindow): SpendingCapacity => {
  const asOf = snapshot.asOf ?? new Date().toISOString()
  const days = windowDays(asOf, window).length
  const day = Number(asOf.slice(8, 10)), end = new Date(Date.UTC(Number(asOf.slice(0, 4)), Number(asOf.slice(5, 7)), 0)).getUTCDate()
  const remaining = Math.max(1, end - day + 1)
  const protectedMinor = protectedCapacity(snapshot)
  const recommendedMinor = protectedMinor * BigInt(days) / BigInt(remaining)
  return { recommendedSpend: money(snapshot.baseCurrency ?? 'UYU', recommendedMinor), protectedCapacity: money(snapshot.baseCurrency ?? 'UYU', protectedMinor), reasons: [] }
}

export const spendingCapacity = getSpendingCapacity
