export interface Settlement {
  id: string
  householdId: string | null
  fromId: string
  toId: string
  amount: number
  note: string | null
  date: string
  createdAt: string
}
