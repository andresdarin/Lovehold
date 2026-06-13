export interface PersonalExpense {
  id: string
  profileId: string
  title: string
  merchant: string | null
  amount: number
  date: string
  type: 'fixed' | 'variable' | 'supermarket'
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

export interface DetectedReceiptItem {
  id: string
  name: string
  quantity: number | null
  unitPrice: number | null
  totalPrice: number
  category: string
  rawLine: string | null
}
