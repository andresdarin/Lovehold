export interface ExpenseItemForm {
  localId: string
  name: string
  itemCategory: string
  quantity: string
  unit: string
  unitPrice: string
  total: string
}

export interface ExpenseForm {
  scope: 'personal' | 'household'
  title: string
  merchant: string
  category: string
  amount: string
  date: string
  paymentMethod: string
  notes: string
}

export type TextFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  disabled?: boolean
  required?: boolean
  min?: string
  step?: string
}

export type SelectFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  options: readonly { value: string; label: string }[]
}
