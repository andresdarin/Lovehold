import { z } from 'zod'

const decimal = z.union([z.string(), z.number()]).transform((value) => Number(value).toFixed(2))
const item = z.object({
  name: z.string().min(1), category: z.string().min(1).optional(), itemCategory: z.string().optional(),
  quantity: z.number().positive().optional(), unitPrice: z.number().positive().optional(),
  totalPrice: z.number().positive().optional(), total: z.number().positive().optional(), rawLine: z.string().optional(), rawText: z.string().optional(), unit: z.string().optional(),
})

export const createExpenseSchema = z.object({
  title: z.string().min(1).max(120), merchant: z.string().max(120).optional(), amount: decimal,
  currency: z.enum(['UYU', 'USD']).default('UYU'), date: z.string().datetime(), category: z.string().min(1).max(80),
  type: z.enum(['fixed', 'variable', 'supermarket']).optional(), notes: z.string().max(500).optional(),
  isRecurring: z.boolean().optional(), recurrenceDay: z.number().int().min(1).max(31).optional(),
  items: z.array(item).optional(), financeAccountId: z.string().optional(), scheduledCashFlowId: z.string().optional(), scheduledDueOn: z.string().optional(),
})
export const registerIncomeSchema = z.object({
  title: z.string().min(1).max(120), amount: decimal, currency: z.enum(['UYU', 'USD']).default('UYU'),
  dueOn: z.string().datetime(), accountId: z.string().optional(), frequency: z.enum(['ONCE', 'MONTHLY']).default('ONCE'), sourceMessageId: z.string().min(1).optional(),
})
export const simulatePurchaseSchema = z.object({ amount: decimal, currency: z.enum(['UYU', 'USD']).default('UYU') })
export const resolveScheduledCashFlowSchema = z.object({ expectedDueOn: z.string().date(), resolution: z.enum(['PAID', 'RECEIVED', 'SKIPPED']) })
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type RegisterIncomeInput = z.infer<typeof registerIncomeSchema>
export type SimulatePurchaseInput = z.infer<typeof simulatePurchaseSchema>
