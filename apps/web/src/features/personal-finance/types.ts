export type FinanceAccountType = 'CASH' | 'BANK' | 'CREDIT'
export type FinancialMovementType = 'EXPENSE' | 'INCOME' | 'TRANSFER'
export type FinancialInputMethod = 'MANUAL' | 'RECEIPT_SCAN' | 'IMPORT'

export interface FinanceAccount {
  id: string
  profileId: string
  name: string
  type: FinanceAccountType
  currency: 'UYU' | 'USD'
  balance: number
  creditLimit?: number | null
  closingDay?: number | null
  dueDay?: number | null
  isSpendable: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PersonalExpense {
  id: string
  profileId: string
  title: string
  merchant: string | null
  amount: number
  currency?: string
  date: string
  type: 'fixed' | 'variable' | 'supermarket'
  movementType?: FinancialMovementType
  inputMethod?: FinancialInputMethod
  category: string
  notes: string | null
  isRecurring: boolean
  recurrenceDay: number | null
  monthKey: string
  financeAccountId?: string | null
  destinationAccountId?: string | null
  financeAccount?: { id: string; name: string; type: FinanceAccountType; currency: string } | null
  destinationAccount?: { id: string; name: string; type: FinanceAccountType; currency: string } | null
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
  totalExpense: number
  totalIncome: number
  netBalance: number
  fixed: number
  variable: number
  supermarket: number
  creditCommitted: number
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

export interface CreateTransferData {
  sourceAccountId: string
  destinationAccountId: string
  amount: string | number
  currency?: 'UYU' | 'USD'
  date: string
  description?: string
}

export interface RegisterIncomeData {
  title: string
  amount: string | number
  currency?: 'UYU' | 'USD'
  dueOn: string
  accountId?: string
  category?: string
}
