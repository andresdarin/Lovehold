export type SplitType = 'equal' | 'percentage' | 'custom'

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
  date: string
  splitType: SplitType
  createdAt: string
  updatedAt: string
}

export interface ExpenseSplit {
  id: string
  expenseId: string
  profileId: string
  amount: number
  percentage: number | null
}
