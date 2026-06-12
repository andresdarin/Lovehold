import { z } from 'zod'

export const SplitTypeEnum = z.enum(['equal', 'percentage', 'custom'])
export const ExpenseItemCategoryEnum = z.enum([
  'ALIMENTOS',
  'VERDURAS',
  'FRUTAS',
  'LACTEOS',
  'CARNES_FIAMBRES',
  'PANIFICADOS',
  'BEBIDAS',
  'ALCOHOL',
  'SNACKS_DULCES',
  'HIGIENE',
  'LIMPIEZA_HOGAR',
  'MASCOTAS',
  'OTROS',
])

export const createExpenseItemSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  itemCategory: ExpenseItemCategoryEnum,
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
  unitPrice: z.number().positive().optional(),
  total: z.number().positive('Item total must be positive'),
  rawText: z.string().optional(),
})

export const createExpenseSchema = z.object({
  householdId: z.string().min(1, 'Household is required'),
  categoryId: z.string().min(1, 'Category is required'),
  paidById: z.string().min(1, 'Payer is required'),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  merchant: z.string().optional(),
  paymentMethod: z.string().optional(),
  receiptDate: z.string().datetime({ offset: true }).optional(),
  notes: z.string().optional(),
  date: z.string().datetime({ offset: true }),
  splitType: SplitTypeEnum.default('equal'),
  items: z.array(createExpenseItemSchema).min(1).optional(),
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
export type CreateExpenseItemInput = z.infer<typeof createExpenseItemSchema>
