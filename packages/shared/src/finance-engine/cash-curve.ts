import { parseMoney, minMinor, maxMinor } from './money'
import { convertAssetWithBidFloor, selectQuote } from './fx'
import { futureGoalContributions } from './goals'
export const baseSpendable = (input: any) => (input.accounts ?? []).filter((a: any) => a.managedByLovehold !== false).reduce((n: bigint, a: any) => { const v = { currency: a.currency, amount: a.spendable ?? '0.00' }; if (a.currency === input.baseCurrency) return n + parseMoney(v.amount); const q = selectQuote(input.fxQuotes ?? [], a.currency, input.baseCurrency, input.asOf); return q ? n + parseMoney(convertAssetWithBidFloor(v, input.baseCurrency, q).amount) : n }, 0n)
export const projectedCashCurve = (input: any) => {
  let value = baseSpendable(input)
  const asOf = input.asOf?.slice(0, 10)
  const rows = [{ date: asOf, value }]
  for (const f of (input.scheduledCashFlows ?? []).slice().sort((a: any, b: any) => a.scheduledDueOn.localeCompare(b.scheduledDueOn))) {
    if (f.direction === 'OUTFLOW' && f.lifecycle === 'OVERDUE') value -= parseMoney(f.amount.amount)
    // RECEIVED cash is already reflected in the account balance; future/estimated
    // income must never make today's capacity look safer.
    rows.push({ date: f.scheduledDueOn, value })
  }
  return rows
}
export const protectedCapacity = (input: any) => {
  const curve = projectedCashCurve(input)
  const buffer = parseMoney(input.minimumBuffer?.amount ?? '0.00')
  const goals = futureGoalContributions(input).reduce((n, g) => n + parseMoney(g.amount), 0n)
  return maxMinor(curve.reduce((n: bigint, r: any) => minMinor(n, r.value), curve[0]?.value ?? 0n) - goals - buffer, 0n)
}
