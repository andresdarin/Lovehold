import { apiFetch } from '@/lib/api'
import { parseAmount } from '../constants'
import type { ExpenseForm, ExpenseItemForm } from '../types'

export async function submitExpense({
  token, form, items, declaredTotal,
}: {
  token: string
  form: ExpenseForm
  items: ExpenseItemForm[]
  declaredTotal: number
}) {
  const isPersonal = form.scope === 'personal'

  await apiFetch('/api/expenses', {
    method: 'POST',
    body: JSON.stringify({
      scope: form.scope,
      title: form.title.trim(),
      merchant: form.merchant.trim() || undefined,
      category: form.category.trim(),
      amount: declaredTotal,
      date: form.date,
      paymentMethod: form.paymentMethod.trim() || undefined,
      splitType: isPersonal ? undefined : 'EQUAL',
      notes: form.notes.trim() || undefined,
      items: items.length
        ? items.map((item) => ({
            name: item.name.trim(),
            itemCategory: item.itemCategory,
            quantity: item.quantity ? parseAmount(item.quantity) : undefined,
            unit: item.unit.trim() || undefined,
            unitPrice: item.unitPrice ? parseAmount(item.unitPrice) : undefined,
            total: parseAmount(item.total),
          }))
        : undefined,
    }),
  }, token)
}
