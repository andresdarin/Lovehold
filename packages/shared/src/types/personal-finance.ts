export const EXPENSE_TYPES = ['fixed', 'variable', 'supermarket'] as const
export type ExpenseType = (typeof EXPENSE_TYPES)[number]

export const FIXED_CATEGORIES = ['alquiler', 'ute', 'ose', 'antel', 'internet', 'gastos_comunes', 'otros_fijos'] as const
export const VARIABLE_CATEGORIES = ['delivery', 'transporte', 'salud', 'ocio', 'mascotas', 'compras', 'otros_variables'] as const
export const SUPERMARKET_CATEGORIES = ['alimentos', 'bebidas', 'limpieza', 'higiene', 'snacks', 'mascotas', 'farmacia', 'otros_super'] as const

export type FixedCategory = (typeof FIXED_CATEGORIES)[number]
export type VariableCategory = (typeof VARIABLE_CATEGORIES)[number]
export type SupermarketItemCategory = (typeof SUPERMARKET_CATEGORIES)[number]

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
