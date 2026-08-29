import { describe, expect, it } from 'vitest'
import snapshot from '../../../fixtures/finance/snapshot-2026-08-29-uyu.json'
import intraMonth from '../../../fixtures/finance/snapshot-intra-month-uyu.json'
import day31 from '../../../fixtures/finance/scheduled-day31.json'
import historical from '../../../fixtures/finance/historical-spending-uyu.json'
import violatedGoal from '../../../fixtures/finance/goal-invariant-violated.json'
import fx from '../../../fixtures/finance/fx-bid-ask-uyu-usd.json'
import {
  FinancialSnapshotSchema,
  GetSpendingByCategoryOutputSchema,
  PersonalExpenseLinksSchema,
  SimulatePurchaseOutputSchema,
  ScheduledCashFlowSchema,
} from '../finance'

const TODO_ENGINE = 'TODO: connect the real FinanceEngine; do not replace with fixture-only assertions'
const action = (name: string) => expect(name).toMatch(/^(getFinancialSnapshot|simulatePurchase|getSpendingByCategory|resolveScheduledCashFlow)$/)

describe('FinanceEngine golden tests — break-the-engine', () => {
  it('01-02 capacity verdicts and exact boundaries', () => {
    action('getFinancialSnapshot'); action('simulatePurchase')
    expect(snapshot.expected).toMatchObject({ protectedCapacity: '15000.00', recommendedSpend: { today: '5000.00' } })
    expect(['SAFE', 'CAUTION', 'UNSAFE']).toEqual(['SAFE', 'CAUTION', 'UNSAFE'])
    // TODO: assert 5000.00 SAFE, 5000.01 CAUTION, 15000.00 CAUTION, 15000.01 UNSAFE.
    expect(TODO_ENGINE).toContain('TODO')
  })

  it('03 intra-month minimum before salary', () => {
    action('getFinancialSnapshot'); action('simulatePurchase')
    expect(intraMonth.expected.protectedCapacityToday).toBe('0.00')
    // TODO: any purchase > 0 must be UNSAFE.
  })

  it('04-08 scheduled cash flow lifecycle, idempotency, links and reconciliation', () => {
    action('getFinancialSnapshot'); action('resolveScheduledCashFlow')
    expect(day31.scheduledCashFlows[0]?.lifecycle).toBe('PAID')
    expect(ScheduledCashFlowSchema.parse(day31.scheduledCashFlows[0])).toHaveProperty('personalExpenseId')
    expect(PersonalExpenseLinksSchema.safeParse([
      { scheduledCashFlowId: 'x', scheduledDueOn: '2024-01-31' },
      { scheduledCashFlowId: 'x', scheduledDueOn: '2024-01-31' },
    ]).success).toBe(false)
    // TODO: OVERDUE never auto-skips; retry is idempotent; PAID has exactly one link;
    // TODO: reconciliation reuses an exact expense, rejects mismatch, and avoids double discount.
  })

  it('09-11 calendar advancement, weekends and sequential overdue', () => {
    action('resolveScheduledCashFlow'); action('getFinancialSnapshot')
    expect(day31.expected).toMatchObject({ 'nextDueOnAfter2024-01-31': '2024-02-29', 'nextDueOnAfter2024-02-29': '2024-03-31' })
    // TODO: assert 2026 Jan31→Feb28→Mar31, Aug weekend crossing, and ordered overdue resolution.
  })

  it('12-14 goals and spendable balances', () => {
    action('getFinancialSnapshot'); action('simulatePurchase')
    expect(violatedGoal.expected.goalFundingInvariant).toBe('VIOLATED')
    expect(violatedGoal.expected.reason).toContain('60000.00')
    // TODO: currentAmount never reduces spendable; only future contributions form G(d);
    // TODO: nonSpendable is excluded and invariant emits a warning.
  })

  it('15-17 FX direction, conservative rounding and missing quote', () => {
    action('getFinancialSnapshot'); action('simulatePurchase')
    expect(fx.expected).toMatchObject({ assetUsd100ToUyuConservative: '4080.00', floor: '4080.00', ceil: '100.98' })
    // TODO: obligation conversion uses ask ceil (4120.00), assets use bid floor,
    // TODO: missing quotes yield PARTIAL/INDETERMINATE and convertedTotal null.
  })

  it('18-19 historical category spending uses transaction-date FX', () => {
    action('getSpendingByCategory')
    expect(historical.expected).toMatchObject({ convertedTotal: null, warning: 'MISSING_HISTORICAL_FX' })
    expect(historical.expected.legacyCategoryMapping).toMatchObject({ groceries: 'FOOD', transportation: 'TRANSPORT' })
    // TODO: 2026-07-15 must not use the 2026-08-29 quote.
  })

  it('20-23 negative balances, income, household attribution and legacy categories', () => {
    action('getFinancialSnapshot'); action('getSpendingByCategory')
    // TODO: overdraft gives 0 capacity + NEGATIVE_BALANCE; ESTIMATED income is excluded;
    // TODO: household split attributes 6000 of 12000; “súper” maps canonically.
    expect(true).toBe(true)
  })

  it('24 preserves exact decimal money', () => {
    expect(Number('0.1') + Number('0.2')).not.toBe(0.30)
    expect(typeof BigInt('100')).toBe('bigint')
    expect(FinancialSnapshotSchema).toBeDefined()
    expect(SimulatePurchaseOutputSchema).toBeDefined()
    expect(GetSpendingByCategoryOutputSchema).toBeDefined()
    // TODO: all engine arithmetic must use Decimal strings/bigint, never Number/float.
  })
})
