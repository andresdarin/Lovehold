export type SplitType = 'equal' | 'percentage' | 'custom'

export const EXPENSE_ITEM_CATEGORIES = [
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
] as const

export type ExpenseItemCategory = (typeof EXPENSE_ITEM_CATEGORIES)[number]

export interface Category {
  id: string
  householdId: string
  name: string
  icon: string
  color: string
  createdAt: string
}

export interface Expense {
  id: string
  householdId: string
  categoryId: string
  paidById: string
  createdById: string
  amount: number
  description: string
  merchant: string | null
  paymentMethod: string | null
  receiptDate: string | null
  notes: string | null
  date: string
  splitType: SplitType
  createdAt: string
  updatedAt: string
  items?: ExpenseItem[]
}

export interface ExpenseSplit {
  id: string
  expenseId: string
  profileId: string
  amount: number
  percentage: number | null
}

export interface ExpenseItem {
  id: string
  expenseId: string
  name: string
  itemCategory: ExpenseItemCategory
  quantity: number | null
  unit: string | null
  unitPrice: number | null
  total: number
  rawText: string | null
  createdAt: string
  updatedAt: string
}
