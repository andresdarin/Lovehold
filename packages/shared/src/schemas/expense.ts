import { z } from 'zod'

export const SplitTypeEnum = z.enum(['equal', 'percentage', 'custom'])

export const createExpenseSchema = z.object({
  householdId: z.string().min(1, 'Household is required'),
  categoryId: z.string().min(1, 'Category is required'),
  paidById: z.string().min(1, 'Payer is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().datetime({ offset: true }),
  splitType: SplitTypeEnum.default('equal'),
  splits: z
    .array(
      z.object({
        profileId: z.string().min(1),
        amount: z.number().positive().optional(),
        percentage: z.number().min(0).max(100).optional(),
      })
    )
    .optional(),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
