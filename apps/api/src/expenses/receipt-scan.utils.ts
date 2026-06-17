import { BadRequestException } from '@nestjs/common'
import { EXPENSE_ITEM_CATEGORIES } from './dto/create-expense.dto'
import type { ScanReceiptResponse } from './receipt-scan.types'
import { reconcileReceiptTotals } from './receipt-scan.totals'
import { normalizeGeminiWarnings } from './receipt-scan.warnings'
export function normalizeDate(raw: string | null): string | null {
  if (!raw) return null
  const trimmed = raw.trim()

  const isoMatch = trimmed.match(/^\d{4}-\d{2}-\d{2}$/)
  if (isoMatch) return trimmed

  const ddmmyy = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (ddmmyy) {
    const [, d, m, y] = ddmmyy
    return `${y}-${m}-${d}`
  }

  const ddmmyy2 = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{2})$/)
  if (ddmmyy2) {
    const [, d, m, y] = ddmmyy2
    return `20${y}-${m}-${d}`
  }

  return null
}

export function parseUruguayanPrice(raw: string | number | null): number | null {
  if (raw === null || raw === undefined) return null
  if (typeof raw === 'number' && !Number.isNaN(raw)) return raw

  const str = String(raw).trim()
  if (!str) return null

  const withoutSymbol = str.replace(/[$\s]/g, '')
  const lastComma = withoutSymbol.lastIndexOf(',')
  const cleaned = lastComma >= 0
    ? withoutSymbol.slice(0, lastComma).replace(/\./g, '') + '.' + withoutSymbol.slice(lastComma + 1)
    : withoutSymbol.replace(/\./g, '')

  const n = parseFloat(cleaned)
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null
}

export function mapCategory(category: string): string {
  if (!category) return 'OTROS'
  const normalized = category.toUpperCase().trim()
  return EXPENSE_ITEM_CATEGORIES.includes(normalized as typeof EXPENSE_ITEM_CATEGORIES[number]) ? normalized : 'OTROS'
}

function normalizeItem(item: unknown) {
  if (!item || typeof item !== 'object') {
    return { name: 'Producto desconocido', quantity: null, unitPrice: null, totalPrice: 0, category: 'OTROS' }
  }

  const i = item as Record<string, unknown>
  return {
    name: typeof i.name === 'string' && i.name.trim() ? i.name.trim() : 'Producto desconocido',
    quantity: parseUruguayanPrice(i.quantity as string | number | null),
    unitPrice: parseUruguayanPrice(i.unitPrice as string | number | null),
    totalPrice: parseUruguayanPrice(i.totalPrice as string | number | null) ?? 0,
    category: mapCategory(typeof i.category === 'string' ? i.category : ''),
  }
}

export function validateAndNormalize(raw: unknown): ScanReceiptResponse {
  if (!raw || typeof raw !== 'object') {
    throw new BadRequestException('Gemini response is not a valid object')
  }

  const data = raw as Record<string, unknown>

  let items = Array.isArray(data.items) ? data.items.map(normalizeItem) : []

  const total = parseUruguayanPrice(data.total as string | number | null)

  // Fallback for non-supermarket bills/services (like Abitab):
  // if no items were extracted but we have a valid total, create a single fallback item
  if (items.length === 0 && total !== null && total > 0) {
    const merchantName = typeof data.merchant === 'string' && data.merchant.trim()
      ? data.merchant.trim()
      : 'Servicio'
    items = [{
      name: `Pago ${merchantName}`,
      quantity: 1,
      unitPrice: total,
      totalPrice: total,
      category: 'OTROS',
    }]
  }

  const itemsTotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const warnings = normalizeGeminiWarnings(data.warnings)

  const { subtotal, discounts } = reconcileReceiptTotals({
    itemCount: items.length,
    itemsTotal,
    total,
    subtotal: parseUruguayanPrice(data.subtotal as string | number | null),
    discounts: parseUruguayanPrice(data.discounts as string | number | null),
    warnings,
  })

  return {
    merchant: typeof data.merchant === 'string' ? data.merchant.trim() || null : null,
    receiptDate: normalizeDate(typeof data.receiptDate === 'string' ? data.receiptDate : null),
    currency: (typeof data.currency === 'string' && (data.currency.toUpperCase() === 'USD' || data.currency.toUpperCase() === 'U$S')) ? 'USD' : 'UYU',
    total,
    subtotal,
    discounts,
    paymentMethod: typeof data.paymentMethod === 'string' ? data.paymentMethod.trim() || null : null,
    items,
    confidence: typeof data.confidence === 'number' ? Math.max(0, Math.min(1, data.confidence)) : 0,
    warnings,
  }
}
