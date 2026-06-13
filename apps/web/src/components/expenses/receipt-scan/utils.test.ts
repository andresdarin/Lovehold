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

  it('spreads a receipt discount across item totals so the form matches the paid total', () => {
    const response: ScanReceiptResponse = {
      merchant: 'ADENDA',
      receiptDate: '2026-06-12',
      currency: 'UYU',
      total: 813.21,
      subtotal: 841.21,
      discounts: 28,
      paymentMethod: 'MASTER',
      items: [
        { name: 'CHOCO AVELLANA COFLER', quantity: 1, unitPrice: 199, totalPrice: 199, category: 'SNACKS_DULCES' },
        { name: 'MUZARELLA CONAPROLE', quantity: 0.225, unitPrice: 590, totalPrice: 132.75, category: 'LACTEOS' },
        { name: 'JAMON COCIDO SCHNECK', quantity: 0.205, unitPrice: 820, totalPrice: 168.1, category: 'CARNES_FIAMBRES' },
        { name: 'BIZCOCHOS PAGNIFIQUE', quantity: 0.295, unitPrice: 669.02, totalPrice: 197.36, category: 'PANIFICADOS' },
        { name: '3D MEGATUBE BARBACOA', quantity: 1, unitPrice: 52, totalPrice: 52, category: 'SNACKS_DULCES' },
        { name: 'KNORR SSA FILETTO', quantity: 1, unitPrice: 92, totalPrice: 92, category: 'ALIMENTOS' },
      ],
      confidence: 0.9,
      warnings: [],
    }

    const formItems = scanResultToFormItems(response)
    const formTotal = formItems.reduce((sum, item) => sum + Number(item.total), 0)

    expect(formTotal).toBe(813.21)
    expect(Number(formItems[0]?.total)).toBeLessThan(199)
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
