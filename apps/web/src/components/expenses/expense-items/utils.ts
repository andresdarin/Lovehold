import { ITEM_CATEGORIES } from '../constants'
import type { ExpenseItemForm } from '../types'

export function categoryLabel(value: string): string {
  return ITEM_CATEGORIES.find((category) => category.value === value)?.label ?? value
}

export function measureLabel(item: ExpenseItemForm): string {
  const quantity = item.quantity.trim() || '1'
  const unit = item.unit.trim() || 'unidad'
  return `${quantity} ${unit}`
}
