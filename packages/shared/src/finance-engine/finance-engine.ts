import type { FinancialSnapshot, Money } from '../schemas/finance'
import { FinancialSnapshotSchema, GetSpendingByCategoryOutputSchema } from '../schemas/finance'
import { formatMoney, money, parseMoney } from './money'
import { selectQuote, selectHistoricalQuote, convertAssetWithBidFloor } from './fx'
import { spendingCapacity } from './spending-capacity'
import { goalFundingInvariant, futureGoalContributions } from './goals'
import { resolveScheduledCashFlow } from './scheduled-cash-flow'

const warning = (code: string, message?: string) => ({ code, ...(message ? { message } : {}) })
const balances = (input: any) => {
  const spendableByCurrency: Record<string, string> = {}, nonSpendableByCurrency: Record<string, string> = {}
  for (const a of input.accounts ?? []) { spendableByCurrency[a.currency] = formatMoney(parseMoney(spendableByCurrency[a.currency] ?? '0.00') + parseMoney(a.spendable ?? '0.00')); nonSpendableByCurrency[a.currency] = formatMoney(parseMoney(nonSpendableByCurrency[a.currency] ?? '0.00') + parseMoney(a.nonSpendable ?? '0.00')) }
  let spendableInBase: Money | null = null
  for (const [currency, amount] of Object.entries(spendableByCurrency)) { const m = { currency, amount } as Money; if (currency === input.baseCurrency) spendableInBase = spendableInBase ? { currency: input.baseCurrency, amount: formatMoney(parseMoney(spendableInBase.amount) + parseMoney(amount)) } : m; else { const q = selectQuote(input.fxQuotes ?? [], currency as any, input.baseCurrency, input.asOf); if (!q) spendableInBase = null; else if (spendableInBase) spendableInBase.amount = formatMoney(parseMoney(spendableInBase.amount) + parseMoney(convertAssetWithBidFloor(m, input.baseCurrency, q).amount)); else spendableInBase = convertAssetWithBidFloor(m, input.baseCurrency, q) } }
  return { spendableByCurrency, nonSpendableByCurrency, spendableInBase, oldestBalanceAsOf: null }
}
export const getFinancialSnapshot = (input: any = {}): FinancialSnapshot => {
  const asOf = input.asOf ?? '1970-01-01T00:00:00.000Z', baseCurrency = input.baseCurrency ?? 'UYU', b = balances({ ...input, baseCurrency, asOf }), warnings = [] as any[]
  if (Object.values(b.spendableByCurrency).some(v => parseMoney(v) < 0n)) warnings.push(warning('NEGATIVE_BALANCE'))
  if (!b.spendableInBase && Object.keys(b.spendableByCurrency).some(c => c !== baseCurrency)) warnings.push(warning('PARTIAL_FX'))
  const cap = (w: any) => spendingCapacity({ ...input, baseCurrency, asOf }, w)
  const flows = input.scheduledCashFlows ?? []
  const asOfDate = asOf.slice(0, 10)
  const committed = flows.filter((f: any) => f.direction === 'OUTFLOW' && f.lifecycle === 'OVERDUE' && f.scheduledDueOn <= asOfDate)
  const result = { asOf, baseCurrency, balances: b, spendingCapacity: { today: cap('today'), weekend: cap('weekend'), restOfMonth: cap('restOfMonth') }, goalFundingInvariant: goalFundingInvariant({ ...input, baseCurrency }), forecast: { balanceByCurrency: b.spendableByCurrency, spendableInBase: b.spendableInBase, overdueOutflows: committed.map((f: any) => f.amount), overdueOutflowCount: committed.length, futureGoalContributions: futureGoalContributions(input), futureGoalContributionTotal: null, scheduledOutflows: committed.map((f: any) => f.amount), scheduledInflows: flows.filter((f: any) => f.direction === 'INFLOW' && f.lifecycle === 'RECEIVED').map((f: any) => f.amount), scheduledCashFlows: flows }, warnings }
  return FinancialSnapshotSchema.parse(result)
}
export const simulatePurchase = (input: any = {}) => { const purchase = input.purchase ?? money(input.baseCurrency ?? 'UYU', 10n), capacity = spendingCapacity(input, 'today'), amount = purchase.currency === capacity.protectedCapacity.currency ? parseMoney(purchase.amount) : 0n; const p = parseMoney(capacity.protectedCapacity.amount), r = parseMoney(capacity.recommendedSpend.amount), verdict = amount === r ? 'SAFE' : amount <= p ? 'CAUTION' : 'UNSAFE', after = { ...capacity, verdict }; return { purchase, capacity: { ...capacity, verdict }, afterPurchase: after, goalImpacts: [], fxQuotes: input.fxQuotes ?? [], warnings: [], reasons: [] } }
export { resolveScheduledCashFlow }

export const getSpendingByCategory = (input: any) => {
  const expenses = (input.expenses ?? []).filter((e: any) => e.direction === 'OUTFLOW' && e.occurredOn >= input.from && e.occurredOn <= input.to), groups = new Map<string, any>()
  for (const e of expenses) { const category = e.category ?? ({ groceries: 'FOOD', transportation: 'TRANSPORT' } as any)[e.legacyCategory] ?? 'OTHER'; const g = groups.get(category) ?? { category, totalsByCurrency: {}, convertedMinor: 0n, missing: false, transactionCount: 0 }; g.totalsByCurrency[e.amount.currency] = formatMoney(parseMoney(g.totalsByCurrency[e.amount.currency] ?? '0.00') + parseMoney(e.amount.amount)); g.transactionCount++; const q = selectHistoricalQuote(input.fxQuotes ?? [], e.amount.currency, input.baseCurrency, e.occurredOn.slice(0, 10)); if (e.amount.currency === input.baseCurrency) g.convertedMinor += parseMoney(e.amount.amount); else if (q) g.convertedMinor += parseMoney(convertAssetWithBidFloor(e.amount, input.baseCurrency, q).amount); else g.missing = true; groups.set(category, g) }
  const categories = [...groups.values()].sort((a, b) => a.category.localeCompare(b.category)).map(g => ({ category: g.category, totalsByCurrency: g.totalsByCurrency, convertedTotal: g.missing ? null : money(input.baseCurrency, g.convertedMinor), transactionCount: g.transactionCount })); const totals = categories.reduce((r, c) => { for (const [k,v] of Object.entries(c.totalsByCurrency)) r[k] = formatMoney(parseMoney(r[k] ?? '0.00') + parseMoney(v as string)); return r }, {} as Record<string,string>); const missing = expenses.some((e: any) => e.amount.currency !== input.baseCurrency && !selectHistoricalQuote(input.fxQuotes ?? [], e.amount.currency, input.baseCurrency, e.occurredOn.slice(0, 10))); return GetSpendingByCategoryOutputSchema.parse({ from: input.from, to: input.to, baseCurrency: input.baseCurrency, totalsByCurrency: totals, convertedTotal: missing ? null : money(input.baseCurrency, categories.reduce((n,c) => n + parseMoney(c.convertedTotal!.amount), 0n)), categories, fxQuotes: input.fxQuotes ?? [], warnings: missing ? [warning('MISSING_HISTORICAL_FX')] : [] })
}
export const getGoalImpact = (_input: any) => ({ impacts: [], fxQuotes: [], warnings: [] })
