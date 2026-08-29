import type { PersonalExpense, MonthlySummary, ProductRankingItem } from './types'

export function computeSummary(expenses: PersonalExpense[]): MonthlySummary {
  let totalExpense = 0
  let totalIncome = 0
  let fixed = 0
  let variable = 0
  let supermarket = 0
  let creditCommitted = 0
  const byCategory: Record<string, number> = {}

  const incomeByCurrency = { UYU: 0, USD: 0 }
  const expenseByCurrency = { UYU: 0, USD: 0 }

  for (const e of expenses) {
    const cur = (e.currency === 'USD' ? 'USD' : 'UYU') as 'UYU' | 'USD'

    if (e.movementType === 'INCOME') {
      incomeByCurrency[cur] += e.amount
      totalIncome += e.amount
    } else if (!e.movementType || e.movementType === 'EXPENSE') {
      expenseByCurrency[cur] += e.amount
      totalExpense += e.amount

      // Normalizar y unificar categorías equivalentes de supermercado
      let categoryKey = e.category.toLowerCase().trim()
      if (categoryKey === 'compras de súper' || categoryKey === 'compras de super' || categoryKey === 'supermercado') {
        categoryKey = 'supermercado'
      }

      byCategory[categoryKey] = (byCategory[categoryKey] ?? 0) + e.amount
      if (e.type === 'fixed') fixed += e.amount
      else if (e.type === 'supermarket') supermarket += e.amount
      else variable += e.amount

      if (e.financeAccount?.type === 'CREDIT') {
        creditCommitted += e.amount
      }
    }
  }

  const netByCurrency = {
    UYU: incomeByCurrency.UYU - expenseByCurrency.UYU,
    USD: incomeByCurrency.USD - expenseByCurrency.USD,
  }

  const netBalance = totalIncome - totalExpense

  return {
    total: totalExpense,
    totalExpense,
    totalIncome,
    netBalance,
    fixed,
    variable,
    supermarket,
    creditCommitted,
    count: expenses.length,
    byCategory,
    incomeByCurrency,
    expenseByCurrency,
    netByCurrency,
  }
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
