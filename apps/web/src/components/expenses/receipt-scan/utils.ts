import { makeItem } from '../constants'
import type { ExpenseItemForm } from '../types'
import type { ScanReceiptResponse } from './types'

export function scanResultToFormItems(response: ScanReceiptResponse): ExpenseItemForm[] {
  return response.items.map((item, index) =>
    makeItem({
      localId: `scan-${index}-${Date.now()}`,
      name: item.name,
      itemCategory: item.category,
      quantity: item.quantity?.toString() ?? '',
      unit: '',
      unitPrice: item.unitPrice?.toString() ?? '',
      total: item.totalPrice.toFixed(2),
    }),
  )
}

export function confidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-success'
  if (confidence >= 0.75) return 'text-warning'
  return 'text-danger'
}

export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.9) return 'Confianza alta'
  if (confidence >= 0.75) return 'Confianza media'
  return 'Confianza baja'
}
