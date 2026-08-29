import { z } from 'zod'

export const scanReceiptResponseSchema = z.object({
  merchant: z.string().nullable(),
  receiptDate: z.string().nullable(),
  currency: z.enum(['UYU', 'USD']),
  total: z.number().nullable(),
  subtotal: z.number().nullable(),
  discounts: z.number().nullable(),
  paymentMethod: z.string().nullable(),
  items: z.array(z.object({
    name: z.string(), quantity: z.number().nullable(), unitPrice: z.number().nullable(),
    totalPrice: z.number(), category: z.string(),
  })),
  confidence: z.number(),
  warnings: z.array(z.string()),
})

export type ScanReceiptContract = z.infer<typeof scanReceiptResponseSchema>
