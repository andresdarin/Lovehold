import { describe, it, expect } from 'vitest'
import { normalizeDate, parseUruguayanPrice, mapCategory, validateAndNormalize } from './receipt-scan.utils'

describe('normalizeDate', () => {
  it('passes ISO through', () => {
    expect(normalizeDate('2026-06-13')).toBe('2026-06-13')
  })

  it('converts DD/MM/YYYY', () => {
    expect(normalizeDate('13/06/2026')).toBe('2026-06-13')
  })

  it('converts DD/MM/YY', () => {
    expect(normalizeDate('13/06/26')).toBe('2026-06-13')
  })

  it('returns null for garbage', () => {
    expect(normalizeDate('not-a-date')).toBeNull()
  })

  it('returns null for null', () => {
    expect(normalizeDate(null)).toBeNull()
  })
})

describe('parseUruguayanPrice', () => {
  it('parses simple number', () => {
    expect(parseUruguayanPrice(123.45)).toBe(123.45)
  })

  it('parses string with comma decimal', () => {
    expect(parseUruguayanPrice('123,45')).toBe(123.45)
  })

  it('parses with thousands separator', () => {
    expect(parseUruguayanPrice('1.234,56')).toBe(1234.56)
  })

  it('parses with $ symbol', () => {
    expect(parseUruguayanPrice('$ 1.234,56')).toBe(1234.56)
  })

  it('returns null for empty', () => {
    expect(parseUruguayanPrice('')).toBeNull()
  })

  it('returns null for null', () => {
    expect(parseUruguayanPrice(null)).toBeNull()
  })
})

describe('mapCategory', () => {
  it('maps valid categories', () => {
    expect(mapCategory('ALIMENTOS')).toBe('ALIMENTOS')
    expect(mapCategory('BEBIDAS')).toBe('BEBIDAS')
    expect(mapCategory('MASCOTAS')).toBe('MASCOTAS')
  })

  it('maps lowercase', () => {
    expect(mapCategory('alimentos')).toBe('ALIMENTOS')
  })

  it('falls back to OTROS', () => {
    expect(mapCategory('INVENTED')).toBe('OTROS')
    expect(mapCategory('')).toBe('OTROS')
  })
})

describe('validateAndNormalize', () => {
  it('normalizes valid response', () => {
    const result = validateAndNormalize({
      merchant: '  Tata  ',
      receiptDate: '13/06/2026',
      total: 1042.01,
      items: [
        { name: 'Leche', totalPrice: 60, category: 'LACTEOS' },
        { name: 'Pan', totalPrice: 45, category: 'PANIFICADOS' },
      ],
      confidence: 0.92,
      warnings: [],
    })

    expect(result.merchant).toBe('Tata')
    expect(result.receiptDate).toBe('2026-06-13')
    expect(result.items).toHaveLength(2)
    expect(result.items[0]?.category).toBe('LACTEOS')
    expect(result.items[1]?.category).toBe('PANIFICADOS')
  })

  it('generates warning when items total differs from total', () => {
    const result = validateAndNormalize({
      total: 100,
      items: [
        { name: 'A', totalPrice: 40, category: 'ALIMENTOS' },
        { name: 'B', totalPrice: 40, category: 'ALIMENTOS' },
      ],
      confidence: 0.9,
      warnings: [],
    })

    expect(result.warnings.length).toBeGreaterThanOrEqual(1)
    expect(result.warnings[0]).toContain('difiere')
  })

  it('handles null total gracefully', () => {
    const result = validateAndNormalize({
      total: null,
      items: [
        { name: 'A', totalPrice: 100, category: 'ALIMENTOS' },
      ],
      confidence: 0.8,
      warnings: [],
    })

    expect(result.total).toBeNull()
    expect(result.warnings).toHaveLength(0)
  })

  it('handles completely empty response', () => {
    const result = validateAndNormalize({
      total: null,
      items: [],
      confidence: 0,
      warnings: [],
    })

    expect(result.items).toHaveLength(0)
    expect(result.total).toBeNull()
  })

  it('rejects non-object', () => {
    expect(() => validateAndNormalize('not-json')).toThrow('Gemini response is not a valid object')
  })
})
