import { describe, it, expect } from 'vitest'
import { scanResultToFormItems, confidenceColor, confidenceLabel } from './utils'
import type { ScanReceiptResponse } from './types'

describe('scanResultToFormItems', () => {
  it('converts scanned items to form items', () => {
    const response: ScanReceiptResponse = {
      merchant: 'Tata',
      receiptDate: '2026-06-13',
      currency: 'UYU',
      total: 100.50,
      subtotal: null,
      discounts: null,
      paymentMethod: 'Débito',
      items: [
        { name: 'Leche', quantity: 2, unitPrice: 30, totalPrice: 60, category: 'LACTEOS' },
        { name: 'Pan', quantity: null, unitPrice: null, totalPrice: 40.50, category: 'PANIFICADOS' },
      ],
      confidence: 0.95,
      warnings: [],
    }

    const formItems = scanResultToFormItems(response)

    expect(formItems).toHaveLength(2)
    const fi0 = formItems[0]
    const fi1 = formItems[1]
    expect(fi0?.name).toBe('Leche')
    expect(fi0?.itemCategory).toBe('LACTEOS')
    expect(fi0?.quantity).toBe('2')
    expect(fi0?.unitPrice).toBe('30')
    expect(fi0?.total).toBe('60.00')
    expect(fi1?.name).toBe('Pan')
    expect(fi1?.itemCategory).toBe('PANIFICADOS')
    expect(fi1?.total).toBe('40.50')
  })

  it('returns empty array for no items', () => {
    const response: ScanReceiptResponse = {
      merchant: null, receiptDate: null, currency: 'UYU', total: null,
      subtotal: null, discounts: null, paymentMethod: null,
      items: [], confidence: 0, warnings: [],
    }

    expect(scanResultToFormItems(response)).toHaveLength(0)
  })
})

describe('confidenceColor', () => {
  it('returns success for high confidence', () => expect(confidenceColor(0.95)).toBe('text-success'))
  it('returns warning for medium', () => expect(confidenceColor(0.8)).toBe('text-warning'))
  it('returns danger for low', () => expect(confidenceColor(0.5)).toBe('text-danger'))
})

describe('confidenceLabel', () => {
  it('returns correct labels', () => {
    expect(confidenceLabel(0.95)).toBe('Confianza alta')
    expect(confidenceLabel(0.8)).toBe('Confianza media')
    expect(confidenceLabel(0.5)).toBe('Confianza baja')
  })
})
