import type { Money } from '../schemas/finance'
import { formatMoney, parseMoney, money } from './money'
export const goalFundingInvariant = (input: any) => {
  const ns = (input.accounts ?? []).reduce((n: bigint, a: any) => n + parseMoney(a.nonSpendable ?? '0.00'), 0n)
  const goals = input.goals ?? [], current = goals.reduce((n: bigint, g: any) => n + parseMoney(g.current?.amount ?? '0.00'), 0n)
  if (current > ns) return { status: 'VIOLATED', reasons: [`current ${formatMoney(current)} exceeds nonSpendable ${formatMoney(ns)}`], goalIds: goals.map((g: any) => g.id) }
  return { status: 'VERIFIED', required: money(input.baseCurrency ?? 'UYU', goals.reduce((n: bigint, g: any) => n + parseMoney(g.periodContribution?.amount ?? '0.00') * BigInt(g.remainingPeriods ?? 0), 0n)), funded: money(input.baseCurrency ?? 'UYU', current), goalIds: goals.map((g: any) => g.id), reasons: [] }
}
export const futureGoalContributions = (input: any): Money[] => (input.goals ?? [])
  .filter((g: any) => g.periodContribution)
  .map((g: any) => ({ ...g.periodContribution, amount: g.periodContribution.amount }))
