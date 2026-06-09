import { z } from 'zod'

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  icon: z.string().default('tag'),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color')
    .default('#6366f1'),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
