export const EXPENSE_TYPES = ['fixed', 'variable', 'supermarket'] as const
export type ExpenseType = (typeof EXPENSE_TYPES)[number]

export const FIXED_CATEGORIES = ['alquiler', 'ute', 'ose', 'antel', 'internet', 'gastos_comunes', 'otros_fijos'] as const
export const VARIABLE_CATEGORIES = ['delivery', 'transporte', 'salud', 'ocio', 'mascotas', 'compras', 'otros_variables'] as const
export const SUPERMARKET_CATEGORIES = ['alimentos', 'bebidas', 'limpieza', 'higiene', 'snacks', 'mascotas', 'farmacia', 'otros_super'] as const

export type FixedCategory = (typeof FIXED_CATEGORIES)[number]
export type VariableCategory = (typeof VARIABLE_CATEGORIES)[number]
export type SupermarketItemCategory = (typeof SUPERMARKET_CATEGORIES)[number]

import type { FinanceCategory } from '../schemas/finance'

/** Compatibility boundary for legacy receipt/item categories. */
export const EXPENSE_ITEM_CATEGORY_TO_FINANCE_CATEGORY: Record<string, FinanceCategory> = {
  ALIMENTOS: 'FOOD', VERDURAS: 'FOOD', FRUTAS: 'FOOD', LACTEOS: 'FOOD', CARNES_FIAMBRES: 'FOOD', PANIFICADOS: 'FOOD',
  BEBIDAS: 'FOOD', ALCOHOL: 'FOOD', SNACKS_DULCES: 'FOOD', HIGIENE: 'OTHER', LIMPIEZA_HOGAR: 'OTHER', MASCOTAS: 'PETS', OTROS: 'OTHER',
}
/** Compatibility mapping for free-form legacy expense categories. */
export const LEGACY_CATEGORY_TO_FINANCE_CATEGORY: Record<string, FinanceCategory> = {
  groceries: 'FOOD', supermarket: 'FOOD', alimentos: 'FOOD', transportation: 'TRANSPORT', transporte: 'TRANSPORT',
  housing: 'HOUSING', utilities: 'UTILITIES', health: 'HEALTH', leisure: 'LEISURE', pets: 'PETS', shopping: 'SHOPPING',
  education: 'EDUCATION', debt: 'DEBT', taxes: 'TAXES', food: 'FOOD',
}
export const expenseItemCategoryToFinanceCategory = (value?: string | null): FinanceCategory =>
  EXPENSE_ITEM_CATEGORY_TO_FINANCE_CATEGORY[String(value ?? '').trim().toUpperCase()] ?? 'OTHER'
export const legacyCategoryToFinanceCategory = (value?: string | null): FinanceCategory | undefined =>
  LEGACY_CATEGORY_TO_FINANCE_CATEGORY[String(value ?? '').trim().toLowerCase()]

export interface PersonalExpense {
  id: string
  profileId: string
  title: string
  merchant: string | null
  amount: number
  date: string
  type: ExpenseType
  category: string
  notes: string | null
  isRecurring: boolean
  recurrenceDay: number | null
  monthKey: string
  createdAt: string
  updatedAt: string
  items?: PersonalExpenseItem[]
}

export interface PersonalExpenseItem {
  id: string
  expenseId: string
  name: string
  quantity: number | null
  unitPrice: number | null
  totalPrice: number
  category: string
  rawLine: string | null
  createdAt: string
  updatedAt: string
}

export interface MonthlySummary {
  total: number
  fixed: number
  variable: number
  supermarket: number
  count: number
  byCategory: Record<string, number>
}

export interface ProductRankingItem {
  name: string
  normalizedName: string
  count: number
  totalQuantity: number
  totalSpent: number
}
