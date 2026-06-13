export type ExpenseKind = 'fixed' | 'variable' | 'supermarket' | 'subscription' | 'debt' | 'other'
export type ExpenseScope = 'personal' | 'household'
export type SplitStatus = 'none' | 'pending' | 'split'

export interface MovementItem {
  id: string
  name: string
  category: string
  quantity: number | null
  unit: string | null
  unitPrice: number | null
  totalPrice: number
}

export interface Movement {
  id: string
  title: string
  merchant: string | null
  date: string
  category: string
  kind: ExpenseKind
  scope: ExpenseScope
  splitStatus: SplitStatus
  total: number
  currency: string
  paymentMethod: string | null
  itemsCount: number
  itemsTotal: number
  discounts: number | null
  notes: string | null
  isRecurring: boolean
  recurringLabel: string | null
  items: MovementItem[]
  createdAt: string
}

export interface MonthSummary {
  month: string
  totalSpent: number
  fixedTotal: number
  variableTotal: number
  supermarketTotal: number
  householdTotal: number
  personalTotal: number
  itemsCount: number
}

export interface PaginationInfo {
  limit: number
  offset: number
  hasMore: boolean
}

export interface MovementFilters {
  month: string
  q: string
  kind: string
  scope: string
  category: string
  paymentMethod: string
}

export interface ExpenseListResponse {
  items: Movement[]
  summary: MonthSummary
  pagination: PaginationInfo
}

export const KIND_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'fixed', label: 'Fijo' },
  { value: 'variable', label: 'Variable' },
  { value: 'supermarket', label: 'Supermercado' },
  { value: 'subscription', label: 'Suscripción' },
  { value: 'debt', label: 'Deuda' },
  { value: 'other', label: 'Otro' },
] as const

export const SCOPE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'personal', label: 'Personal' },
  { value: 'household', label: 'Hogar' },
] as const
