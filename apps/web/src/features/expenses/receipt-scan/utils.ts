import { makeItem, toCents } from '../constants'
import type { ExpenseItemForm } from '../types'
import type { ScanReceiptResponse } from './types'

const ROUNDING_TOLERANCE_CENTS = 5

function isWeightedQuantity(quantity: number | null): boolean {
  return quantity !== null && !Number.isInteger(quantity)
}

function formatQuantity(value: number): string {
  return value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '')
}

function adjustedTotals(response: ScanReceiptResponse): number[] {
  const originalCents = response.items.map((item) => toCents(item.totalPrice))
  const originalTotalCents = originalCents.reduce((sum, cents) => sum + cents, 0)
  const paidTotalCents = response.total === null ? null : toCents(response.total)

  if (
    paidTotalCents === null
    || originalTotalCents <= 0
    || originalTotalCents <= paidTotalCents
    || originalTotalCents - paidTotalCents <= ROUNDING_TOLERANCE_CENTS
  ) {
    return response.items.map((item) => item.totalPrice)
  }

  const exactShares = originalCents.map((cents) => cents * paidTotalCents / originalTotalCents)
  const adjustedCents = exactShares.map(Math.floor)
  const centsToDistribute = paidTotalCents - adjustedCents.reduce((sum, cents) => sum + cents, 0)
  const byFraction = exactShares
    .map((share, index) => ({ index, fraction: share - Math.floor(share) }))
    .sort((a, b) => b.fraction - a.fraction)

  for (let i = 0; i < centsToDistribute; i += 1) {
    const target = byFraction[i % byFraction.length]
    if (target) adjustedCents[target.index] = (adjustedCents[target.index] ?? 0) + 1
  }

  return adjustedCents.map((cents) => cents / 100)
}

export function scanResultToFormItems(response: ScanReceiptResponse): ExpenseItemForm[] {
  const totals = adjustedTotals(response)

  return response.items.map((item, index) => {
    const isWeighted = isWeightedQuantity(item.quantity)

    return makeItem({
      localId: `scan-${index}-${Date.now()}`,
      name: item.name,
      itemCategory: item.category,
      quantity: isWeighted ? '1' : item.quantity?.toString() ?? '',
      unit: isWeighted && item.quantity !== null ? `${formatQuantity(item.quantity)} kg` : '',
      unitPrice: isWeighted ? '' : item.unitPrice?.toString() ?? '',
      total: (totals[index] ?? item.totalPrice).toFixed(2),
    })
  })
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
