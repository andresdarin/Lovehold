import { z } from 'zod'

export const createSettlementSchema = z.object({
  householdId: z.string().optional(),
  fromId: z.string().min(1, 'Payer is required'),
  toId: z.string().min(1, 'Receiver is required'),
  amount: z.number().positive('Amount must be positive'),
  note: z.string().optional(),
  date: z.string().datetime({ offset: true }).default(() => new Date().toISOString()),
})

export type CreateSettlementInput = z.infer<typeof createSettlementSchema>
