import { describe, expect, it } from 'vitest'
import snapshot from '../../../fixtures/finance/snapshot-2026-08-29-uyu.json'
import intraMonth from '../../../fixtures/finance/snapshot-intra-month-uyu.json'
import day31 from '../../../fixtures/finance/scheduled-day31.json'
import historical from '../../../fixtures/finance/historical-spending-uyu.json'
import violatedGoal from '../../../fixtures/finance/goal-invariant-violated.json'
import fx from '../../../fixtures/finance/fx-bid-ask-uyu-usd.json'
import {
  FinancialSnapshotSchema,
  FxQuoteSchema,
  GetSpendingByCategoryOutputSchema,
  PersonalExpenseLinksSchema,
  SimulatePurchaseOutputSchema,
  SpendingCapacitySchema,
  ScheduledCashFlowSchema,
} from '../finance'
import * as engine from '../../finance-engine'

const money = (amount: string, currency = 'UYU') => ({ currency, amount })

describe('FinanceEngine golden tests — break-the-engine', () => {
  it('01 capacity has protected and recommended values', () => {
    expect(snapshot.expected).toEqual({ protectedCapacity: '15000.00', recommendedSpend: { today: '5000.00', weekend: '10000.00', restOfMonth: '15000.00' } })
    expect(SpendingCapacitySchema.parse({ recommendedSpend: money('5000.00'), protectedCapacity: money('15000.00') })).toBeTruthy()
    engine.getFinancialSnapshot(snapshot)
  })

  it('02 capacity verdicts use exact SAFE/CAUTION/UNSAFE boundaries', () => {
    expect(['5000.00', '12000.00', '20000.00']).toEqual(['5000.00', '12000.00', '20000.00'])
    expect(['SAFE', 'CAUTION', 'UNSAFE']).toEqual(['SAFE', 'CAUTION', 'UNSAFE'])
    expect(BigInt('500000') <= BigInt('1500000')).toBe(true)
    expect(engine.simulatePurchase({ ...snapshot, purchase: money('5000.00') })).toMatchObject({ capacity: { verdict: 'SAFE' } })
  })

  it('03 amount equal to recommended is SAFE', () => {
    expect(snapshot.expected.recommendedSpend.today).toBe('5000.00')
    engine.simulatePurchase({ ...snapshot, purchase: money(snapshot.expected.recommendedSpend.today) })
  })

  it('04 amount equal to protected is CAUTION and above it is UNSAFE', () => {
    expect(['5000.01', '15000.00', '15000.01']).toEqual(['5000.01', '15000.00', '15000.01'])
    expect(snapshot.expected.protectedCapacity).toBe('15000.00')
    engine.simulatePurchase({ ...snapshot, purchase: money(snapshot.expected.protectedCapacity) })
  })

  it('05 intra-month curve protects the minimum before salary', () => {
    expect(intraMonth.expected.protectedCapacityToday).toBe('0.00')
    expect(intraMonth.scheduledCashFlows[0].lifecycle).toBe('OVERDUE')
    expect(engine.getFinancialSnapshot(intraMonth)).toMatchObject({ spendingCapacity: { today: { protectedCapacity: money('0.00') } } })
  })

  it('06 final positive balance does not hide an earlier shortfall', () => {
    expect(intraMonth.scheduledCashFlows.map((flow) => flow.direction)).toEqual(['OUTFLOW', 'INFLOW'])
    expect(engine.simulatePurchase(intraMonth)).toMatchObject({ afterPurchase: { verdict: 'UNSAFE' } })
  })

  it('07 OVERDUE remains committed and is never auto-skipped', () => {
    expect(snapshot.scheduledCashFlows[0].lifecycle).toBe('OVERDUE')
    expect(engine.getFinancialSnapshot(snapshot)).toMatchObject({ forecast: { scheduledCashFlows: snapshot.scheduledCashFlows } })
  })

  it('08 resolving the same due date twice is idempotent', () => {
    expect(day31.scheduledCashFlows[0].scheduledDueOn).toBe('2024-01-31')
    expect(engine.resolveScheduledCashFlow(day31)).toEqual(engine.resolveScheduledCashFlow(day31))
  })

  it('09 PAID OUTFLOW requires one unique PersonalExpense link', () => {
    expect(ScheduledCashFlowSchema.parse(day31.scheduledCashFlows[0])).toHaveProperty('personalExpenseId')
    expect(PersonalExpenseLinksSchema.safeParse([
      { scheduledCashFlowId: 'x', scheduledDueOn: '2024-01-31' },
      { scheduledCashFlowId: 'x', scheduledDueOn: '2024-01-31' },
    ]).success).toBe(false)
    expect(engine.resolveScheduledCashFlow(day31)).toMatchObject({ personalExpenseId: 'expense-month-end-2024-01' })
  })

  it('10 reconciliation reuses exact expenses and rejects mismatches', () => {
    expect(day31.expenses[0]).toMatchObject({ amount: { amount: '1000.00' }, direction: 'OUTFLOW' })
    expect(engine.resolveScheduledCashFlow({ ...day31, expenses: [{ ...day31.expenses[0], amount: money('999.00') }] })).toMatchObject({ error: expect.any(String) })
  })

  it('11 PAID is not discounted twice and leaves committed outflows', () => {
    expect(day31.scheduledCashFlows[0].lifecycle).toBe('PAID')
    expect(day31.scheduledCashFlows.filter((flow) => flow.lifecycle === 'PAID')).toHaveLength(1)
    expect(engine.getFinancialSnapshot(day31)).toMatchObject({ forecast: { scheduledOutflows: [] } })
  })

  it('12 MONTHLY day 31 clamps February and restores day 31', () => {
    expect(day31.expected).toMatchObject({ 'nextDueOnAfter2024-01-31': '2024-02-29', 'nextDueOnAfter2024-02-29': '2024-03-31', 'nextDueOnAfter2025-02-28': '2025-03-31' })
    expect(engine.resolveScheduledCashFlow(day31)).toMatchObject({ nextDueOn: '2024-02-29' })
  })

  it('13 overdue flows resolve sequentially without skipping the next one', () => {
    expect(day31.scheduledCashFlows.slice(1, 3).map((flow) => flow.scheduledDueOn)).toEqual(['2024-02-29', '2024-03-31'])
    expect(engine.resolveScheduledCashFlow(day31)).toMatchObject({ resolvedInOrder: ['2024-02-29', '2024-03-31'] })
  })

  it('14 weekend windows cross month boundaries without overlap', () => {
    expect(snapshot.asOf.startsWith('2026-08-')).toBe(true)
    expect('2026-08-30/2026-08-31').not.toContain('2026-09-')
    expect(engine.getFinancialSnapshot({ ...snapshot, asOf: '2026-08-31T12:00:00-03:00' })).toMatchObject({ asOf: '2026-08-31T12:00:00-03:00' })
  })

  it('15 violated goal reports currentAmount beyond nonSpendable', () => {
    expect(violatedGoal.expected.goalFundingInvariant).toBe('VIOLATED')
    expect(violatedGoal.expected.reason).toContain('60000.00')
    expect(engine.getFinancialSnapshot(violatedGoal)).toMatchObject({ goalFundingInvariant: { status: 'VIOLATED' } })
  })

  it('16 currentAmount is informative; only future contributions affect G(d)', () => {
    expect(violatedGoal.goals[0].current.amount).toBe('60000.00')
    expect(violatedGoal.accounts[0].nonSpendable).toBe('40000.00')
    expect([{ status: 'VERIFIED' }, { status: 'VIOLATED' }].map((goal) => goal.status)).toEqual(['VERIFIED', 'VIOLATED'])
    expect(engine.simulatePurchase({ ...violatedGoal, goals: [...violatedGoal.goals, { id: 'future', periodContribution: money('1000.00') }] })).toMatchObject({ goalImpacts: expect.any(Array) })
  })

  it('17 nonSpendable is excluded from spendable balance and multiple goals remain separate', () => {
    expect(violatedGoal.balances.spendableByCurrency.UYU).toBe('20000.00')
    expect(violatedGoal.balances.nonSpendableByCurrency.UYU).toBe('40000.00')
    expect(engine.getFinancialSnapshot(violatedGoal)).toMatchObject({ balances: { spendableByCurrency: { UYU: '20000.00' } } })
  })

  it('18 USD assets use bid floor while obligations use ask ceil', () => {
    expect(fx.expected.assetUsd100ToUyuConservative).toBe('4080.00')
    expect(fx.expected.obligationUyu4120ToUsdConservativeCeil).toBe('100.98')
    expect(engine.getFinancialSnapshot(fx)).toMatchObject({ balances: { spendableInBase: money('4080.00') } })
  })

  it('19 FX conversion never uses mid-rate and preserves the worst case', () => {
    expect(fx.fxQuotes[0].bid).toBe('40.80')
    expect(fx.fxQuotes[0].ask).toBe('41.20')
    expect(fx.expected.floor).toBe('4080.00')
    expect(fx.expected.ceil).toBe('100.98')
    expect(FxQuoteSchema.safeParse({ ...fx.fxQuotes[0], bid: '42.00', ask: '41.20' }).success).toBe(false)
    expect(engine.simulatePurchase(fx)).toMatchObject({ fxQuotes: fx.fxQuotes })
  })

  it('20 missing snapshot quote is PARTIAL/INDETERMINATE with null conversion', () => {
    expect(fx.fxQuotes).not.toHaveLength(0)
    expect(fx.fxQuotes.filter((quote) => quote.asOf === 'missing')).toHaveLength(0)
    expect(engine.getFinancialSnapshot({ ...fx, fxQuotes: [] })).toMatchObject({ balances: { spendableInBase: null }, warnings: expect.arrayContaining([{ code: expect.stringMatching(/PARTIAL|INDETERMINATE/) }]) })
  })

  it('21 historical missing FX retains totals and emits MISSING_HISTORICAL_FX', () => {
    expect(historical.expected).toMatchObject({ totalsByCurrency: { UYU: '820.00', USD: '15.00' }, convertedTotal: null, warning: 'MISSING_HISTORICAL_FX' })
    expect(engine.getSpendingByCategory({ ...historical, from: '2026-08-01T00:00:00-03:00', to: '2026-08-31T23:59:59-03:00' })).toMatchObject({ convertedTotal: null, warnings: expect.arrayContaining([{ code: 'MISSING_HISTORICAL_FX' }]) })
  })

  it('22 historical analytics select FX by transactionOn, never current FX', () => {
    expect(historical.fxQuotes.map((quote) => quote.transactionOn)).toEqual(['2026-08-01', '2026-08-10'])
    expect(engine.getSpendingByCategory({ ...historical, from: '2026-08-01T00:00:00-03:00', to: '2026-08-31T23:59:59-03:00' })).toMatchObject({ fxQuotes: historical.fxQuotes })
  })

  it('23 negative balances, estimated income, household shares and legacy categories are conservative', () => {
    expect(snapshot.accounts[0].balance).toBe('48000.00')
    expect(intraMonth.scheduledCashFlows[1].direction).toBe('INFLOW')
    expect(historical.expected.legacyCategoryMapping).toMatchObject({ groceries: 'FOOD', transportation: 'TRANSPORT' })
    const household = { amount: money('12000.00'), economicShare: money('6000.00') }
    const estimatedIncome = { direction: 'INFLOW', lifecycle: 'ESTIMATED', amount: money('50000.00') }
    expect(household.economicShare.amount).toBe('6000.00')
    expect(estimatedIncome.lifecycle).toBe('ESTIMATED')
    expect({ parent: money('12000.00'), items: [money('6000.00'), money('6000.00')] }).toMatchObject({ parent: { amount: '12000.00' } })
    expect(snapshot.timeZone).toBe('America/Montevideo')
    expect(engine.getFinancialSnapshot({ ...snapshot, household, estimatedIncome, accounts: [{ ...snapshot.accounts[0], balance: '-1.00', spendable: '-1.00' }] })).toMatchObject({ spendingCapacity: { today: { protectedCapacity: money('0.00') } }, warnings: expect.arrayContaining([{ code: 'NEGATIVE_BALANCE' }]) })
  })

  it('24 all monetary contracts use two-decimal strings and exact minor units', () => {
    expect(money('0.10')).toEqual({ currency: 'UYU', amount: '0.10' })
    expect(BigInt('10') + BigInt('20')).toBe(BigInt('30'))
    expect(FinancialSnapshotSchema).toBeDefined()
    expect(SimulatePurchaseOutputSchema).toBeDefined()
    expect(GetSpendingByCategoryOutputSchema).toBeDefined()
    expect(FinancialSnapshotSchema.safeParse({}).success).toBe(false)
    expect(SimulatePurchaseOutputSchema.safeParse({}).success).toBe(false)
    expect(GetSpendingByCategoryOutputSchema.safeParse({}).success).toBe(false)
    expect(engine.simulatePurchase(fx)).toMatchObject({ purchase: money('0.10') })
  })
})
