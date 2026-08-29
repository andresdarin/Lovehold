import { z } from 'zod'

/** Decimal values are strings so that financial calculations do not lose precision. */
export const CurrencySchema = z.enum(['UYU', 'USD'])
export const DecimalMoneySchema = z.string().regex(/^-?\d+\.\d{2}$/, 'Amount must have exactly two decimals')
export const PositiveDecimalSchema = z
  .string()
  .regex(/^\d+\.\d{2}$/, 'Amount must have exactly two decimals')
  .refine((value) => Number(value) > 0, 'Amount must be positive')
export const MoneySchema = z.object({ currency: CurrencySchema, amount: DecimalMoneySchema })

const DateTimeSchema = z.string().datetime({ offset: true })
const DateSchema = z.string().date()
const VerdictSchema = z.enum(['SAFE', 'CAUTION', 'UNSAFE'])

const FxQuoteBaseSchema = z.object({
  baseCurrency: CurrencySchema,
  quoteCurrency: CurrencySchema,
  bid: PositiveDecimalSchema,
  ask: PositiveDecimalSchema,
  asOf: DateTimeSchema,
  source: z.string().min(1),
})

const validateFxQuote = <T extends z.ZodTypeAny>(schema: T) => schema.superRefine((quote: z.infer<T>, context) => {
    if (quote.baseCurrency === quote.quoteCurrency)
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['quoteCurrency'], message: 'Currencies must differ' })
    if (Number(quote.bid) - Number(quote.ask) > 1e-9)
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['bid'], message: 'Bid cannot exceed ask' })
  })

export const FxQuoteSchema = validateFxQuote(FxQuoteBaseSchema)

/** Historical quotes are selected by transaction date, never by the current quote. */
export const FxQuoteHistoricalSchema = validateFxQuote(FxQuoteBaseSchema.extend({ transactionOn: DateSchema }))

export const FinanceCategorySchema = z.enum([
  'HOUSING', 'UTILITIES', 'FOOD', 'TRANSPORT', 'HEALTH', 'LEISURE', 'PETS',
  'SHOPPING', 'EDUCATION', 'DEBT', 'TAXES', 'OTHER',
])

export const WarningSchema = z.object({
  code: z.string().min(1),
  message: z.string().optional(),
  details: z.record(z.unknown()).optional(),
})

export const HistoricalFxWarningCode = 'MISSING_HISTORICAL_FX' as const

export const ScheduledCashFlowLifecycleSchema = z.enum(['PAID', 'RECEIVED', 'SKIPPED', 'OVERDUE'])
const ScheduledCashFlowBaseSchema = z.object({
  scheduledCashFlowId: z.string().min(1),
  scheduledDueOn: DateSchema,
  amount: MoneySchema,
  direction: z.enum(['INFLOW', 'OUTFLOW']),
  lifecycle: ScheduledCashFlowLifecycleSchema,
})
export const ScheduledCashFlowSchema = z.union([
  ScheduledCashFlowBaseSchema.extend({ lifecycle: z.literal('PAID'), direction: z.literal('OUTFLOW'), personalExpenseId: z.string().min(1) }),
  ScheduledCashFlowBaseSchema.extend({ lifecycle: z.literal('RECEIVED'), direction: z.literal('INFLOW') }),
  ScheduledCashFlowBaseSchema.extend({ lifecycle: z.literal('SKIPPED') }),
  ScheduledCashFlowBaseSchema.extend({ lifecycle: z.literal('OVERDUE'), direction: z.literal('OUTFLOW') }),
])

/**
 * OUTFLOW PAID has exactly one PersonalExpense (created or reconciled), never zero
 * or duplicated. Creation/reconciliation, FinanceAccount.balance and lastResolved*,
 * plus nextDueOn advancement, must be committed atomically. No occurrence table.
 */
export const PersonalExpenseLinkSchema = z
  .object({
    scheduledCashFlowId: z.string().min(1).optional(),
    scheduledDueOn: DateSchema.optional(),
  })
  .superRefine((link, context) => {
    if ((link.scheduledCashFlowId === undefined) !== (link.scheduledDueOn === undefined)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ['scheduledCashFlowId'], message: 'Both schedule fields are required together' })
    }
  })

/** Validates the logical UNIQUE(scheduledCashFlowId, scheduledDueOn) key. */
export const PersonalExpenseLinksSchema = z.array(PersonalExpenseLinkSchema).superRefine((links, context) => {
  const keys = new Set<string>()
  links.forEach((link, index) => {
    if (link.scheduledCashFlowId && link.scheduledDueOn) {
      const key = `${link.scheduledCashFlowId}:${link.scheduledDueOn}`
      if (keys.has(key)) {
        context.addIssue({ code: z.ZodIssueCode.custom, path: [index], message: 'Duplicate PersonalExpense schedule key' })
      }
      keys.add(key)
    }
  })
})

// SpendingCapacity replaces the deprecated safeToSpend scalar.
export const SpendingCapacitySchema = z.object({
  recommendedSpend: MoneySchema,
  protectedCapacity: MoneySchema,
  reasons: z.array(z.string()).default([]),
})
const SimulationSpendingCapacitySchema = SpendingCapacitySchema.extend({ verdict: VerdictSchema.optional() })

const CurrencyAmountRecordSchema = z.record(CurrencySchema, DecimalMoneySchema)
const BalanceSchema = z.object({
  spendableByCurrency: CurrencyAmountRecordSchema,
  nonSpendableByCurrency: CurrencyAmountRecordSchema,
  spendableInBase: MoneySchema.nullable(),
  oldestBalanceAsOf: DateTimeSchema.nullable(),
})

const GoalFundingInvariantSchema = z.object({
  status: z.enum(['VERIFIED', 'VIOLATED', 'UNVERIFIABLE']),
  required: MoneySchema.optional(),
  funded: MoneySchema.optional(),
  shortfall: MoneySchema.optional(),
  goalIds: z.array(z.string()).default([]),
  reasons: z.array(z.string()).default([]),
})

const ForecastSchema = z.object({
  balanceByCurrency: CurrencyAmountRecordSchema.default({}),
  spendableInBase: MoneySchema.nullable().optional(),
  overdueOutflows: z.array(MoneySchema).default([]),
  overdueOutflowCount: z.number().int().nonnegative().default(0),
  futureGoalContributions: z.array(MoneySchema).default([]),
  futureGoalContributionTotal: MoneySchema.nullable().optional(),
  scheduledOutflows: z.array(MoneySchema).default([]),
  scheduledInflows: z.array(MoneySchema).default([]),
  scheduledCashFlows: z.array(ScheduledCashFlowSchema).default([]),
})

export const GetFinancialSnapshotInputSchema = z.object({
  asOf: DateTimeSchema.optional(),
})

export const FinancialSnapshotSchema = z.object({
  asOf: DateTimeSchema,
  baseCurrency: CurrencySchema,
  balances: BalanceSchema,
  spendingCapacity: z.object({
    today: SpendingCapacitySchema,
    weekend: SpendingCapacitySchema,
    restOfMonth: SpendingCapacitySchema,
  }),
  goalFundingInvariant: GoalFundingInvariantSchema,
  forecast: ForecastSchema,
  warnings: z.array(WarningSchema).default([]),
})

// FinanceAccount contains balances managed by Lovehold; bank synchronization is out of V1.

export const GoalImpactItemSchema = z.object({
  goalId: z.string().min(1),
  goalName: z.string().optional(),
  before: MoneySchema,
  after: MoneySchema,
  impact: MoneySchema,
  status: z.enum(['SAFE', 'AT_RISK', 'UNFUNDED']).optional(),
  explanation: z.string().optional(),
})

export const SimulatePurchaseInputSchema = z.object({
  purchase: z.object({ amount: PositiveDecimalSchema, currency: CurrencySchema }),
  baseCurrency: CurrencySchema,
  category: FinanceCategorySchema.optional(),
  occurredOn: DateTimeSchema.optional(),
})

export const SimulatePurchaseOutputSchema = z.object({
  purchase: MoneySchema,
  capacity: SimulationSpendingCapacitySchema,
  afterPurchase: SimulationSpendingCapacitySchema,
  goalImpacts: z.array(GoalImpactItemSchema).default([]),
  // Simulations use quotes whose asOf matches the simulation's asOf/occurredOn.
  fxQuotes: z.array(FxQuoteSchema).default([]),
  warnings: z.array(WarningSchema).default([]),
  reasons: z.array(z.string()).default([]),
})

export const GetGoalImpactInputSchema = z.object({
  purchase: z.object({ amount: PositiveDecimalSchema, currency: CurrencySchema }),
  baseCurrency: CurrencySchema,
  asOf: DateTimeSchema.optional(),
})

export const GetGoalImpactOutputSchema = z.object({
  impacts: z.array(GoalImpactItemSchema),
  fxQuotes: z.array(FxQuoteSchema).default([]),
  warnings: z.array(WarningSchema).default([]),
})

export const CategorySpendingSchema = z.object({
  category: FinanceCategorySchema,
  totalsByCurrency: CurrencyAmountRecordSchema,
  convertedTotal: MoneySchema.nullable(),
  transactionCount: z.number().int().nonnegative().default(0),
})

export const GetSpendingByCategoryInputSchema = z.object({
  profileId: z.string().min(1),
  from: DateTimeSchema,
  to: DateTimeSchema,
  baseCurrency: CurrencySchema,
  categories: z.array(FinanceCategorySchema).optional(),
})

export const GetSpendingByCategoryOutputSchema = z.object({
  from: DateTimeSchema,
  to: DateTimeSchema,
  baseCurrency: CurrencySchema,
  totalsByCurrency: CurrencyAmountRecordSchema,
  convertedTotal: MoneySchema.nullable(),
  categories: z.array(CategorySpendingSchema),
  fxQuotes: z.array(FxQuoteHistoricalSchema).default([]),
  warnings: z.array(WarningSchema).default([]),
})

export type Currency = z.infer<typeof CurrencySchema>
export type DecimalMoney = z.infer<typeof DecimalMoneySchema>
export type PositiveDecimal = z.infer<typeof PositiveDecimalSchema>
export type Money = z.infer<typeof MoneySchema>
export type FxQuote = z.infer<typeof FxQuoteSchema>
export type FxQuoteHistorical = z.infer<typeof FxQuoteHistoricalSchema>
export type PersonalExpenseLink = z.infer<typeof PersonalExpenseLinkSchema>
export type PersonalExpenseLinks = z.infer<typeof PersonalExpenseLinksSchema>
export type ScheduledCashFlowLifecycle = z.infer<typeof ScheduledCashFlowLifecycleSchema>
export type ScheduledCashFlow = z.infer<typeof ScheduledCashFlowSchema>
export type FinanceCategory = z.infer<typeof FinanceCategorySchema>
export type Warning = z.infer<typeof WarningSchema>
export type SpendingCapacity = z.infer<typeof SpendingCapacitySchema>
export type GetFinancialSnapshotInput = z.infer<typeof GetFinancialSnapshotInputSchema>
export type FinancialSnapshot = z.infer<typeof FinancialSnapshotSchema>
export type SimulatePurchaseInput = z.infer<typeof SimulatePurchaseInputSchema>
export type SimulatePurchaseOutput = z.infer<typeof SimulatePurchaseOutputSchema>
export type GoalImpactItem = z.infer<typeof GoalImpactItemSchema>
export type GetGoalImpactInput = z.infer<typeof GetGoalImpactInputSchema>
export type GetGoalImpactOutput = z.infer<typeof GetGoalImpactOutputSchema>
export type CategorySpending = z.infer<typeof CategorySpendingSchema>
export type GetSpendingByCategoryInput = z.infer<typeof GetSpendingByCategoryInputSchema>
export type GetSpendingByCategoryOutput = z.infer<typeof GetSpendingByCategoryOutputSchema>
