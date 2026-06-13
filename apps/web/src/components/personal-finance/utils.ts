import type { PersonalExpense, MonthlySummary, ProductRankingItem } from './types'

export function computeSummary(expenses: PersonalExpense[]): MonthlySummary {
  let total = 0
  let fixed = 0
  let variable = 0
  let supermarket = 0
  const byCategory: Record<string, number> = {}

  for (const e of expenses) {
    total += e.amount
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount
    if (e.type === 'fixed') fixed += e.amount
    else if (e.type === 'supermarket') supermarket += e.amount
    else variable += e.amount
  }

  return { total, fixed, variable, supermarket, count: expenses.length, byCategory }
}

export function computeProductRanking(items: PersonalExpense['items']): ProductRankingItem[] {
  if (!items?.length) return []

  const grouped: Record<string, ProductRankingItem> = {}

  for (const item of items) {
    const key = item.name.toLowerCase().trim().replace(/\s+/g, ' ')
    if (!grouped[key]) {
      grouped[key] = { name: item.name, normalizedName: key, count: 0, totalQuantity: 0, totalSpent: 0 }
    }
    grouped[key].count += 1
    grouped[key].totalQuantity += item.quantity ?? 1
    grouped[key].totalSpent += item.totalPrice
  }

  return Object.values(grouped)
    .map((g) => ({ ...g, totalSpent: Math.round(g.totalSpent * 100) / 100 }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
}
