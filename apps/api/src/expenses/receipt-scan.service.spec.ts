import { describe, it, expect } from 'vitest'
import { BadRequestException } from '@nestjs/common'
import { ReceiptScanService } from './receipt-scan.service'
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
    expect(result.warnings[0]).toContain('es menor')
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

  it('uses item total minus paid total when Gemini duplicates discount lines', () => {
    const result = validateAndNormalize({
      merchant: 'ADENDA',
      receiptDate: '12/06/2026',
      total: 813.21,
      subtotal: 841.21,
      discounts: 56,
      items: [
        { name: 'CHOCO AVELLANA COFLER', totalPrice: 199, category: 'SNACKS_DULCES' },
        { name: 'MUZARELLA CONAPROLE', totalPrice: 132.75, category: 'LACTEOS' },
        { name: 'JAMON COCIDO SCHNECK', totalPrice: 168.1, category: 'CARNES_FIAMBRES' },
        { name: 'BIZCOCHOS PAGNIFIQUE', totalPrice: 197.36, category: 'PANIFICADOS' },
        { name: '3D MEGATUBE BARBACOA', totalPrice: 52, category: 'SNACKS_DULCES' },
        { name: 'KNORR SSA FILETTO', totalPrice: 92, category: 'ALIMENTOS' },
      ],
      confidence: 0.9,
      warnings: [],
    })

    expect(result.subtotal).toBe(841.21)
    expect(result.discounts).toBe(28)
    expect(result.warnings[0]).toContain('se ajustó a $28.00')
  })

  it('drops Gemini arithmetic warnings before backend reconciliation', () => {
    const result = validateAndNormalize({
      merchant: 'ADENDA',
      receiptDate: '12/06/2026',
      total: 813.21,
      subtotal: 841.21,
      discounts: 56,
      items: [
        { name: 'CHOCO AVELLANA COFLER', totalPrice: 199, category: 'SNACKS_DULCES' },
        { name: 'MUZARELLA CONAPROLE', totalPrice: 132.75, category: 'LACTEOS' },
        { name: 'JAMON COCIDO SCHNECK', totalPrice: 168.1, category: 'CARNES_FIAMBRES' },
        { name: 'BIZCOCHOS PAGNIFIQUE', totalPrice: 197.36, category: 'PANIFICADOS' },
        { name: '3D MEGATUBE BARBACOA', totalPrice: 52, category: 'SNACKS_DULCES' },
        { name: 'KNORR SSA FILETTO', totalPrice: 92, category: 'ALIMENTOS' },
      ],
      confidence: 0.9,
      warnings: [
        'Calculated subtotal (sum of items: 841.21) minus discounts (56.00) equals 785.21, which does not match the final total (813.21).',
        'The IVA breakdown is inconsistent with these figures.',
        'Lectura dudosa en nombre de producto: BIZCOCHOS PAGNIFIQUE.',
      ],
    })

    expect(result.discounts).toBe(28)
    expect(result.warnings.join(' ')).not.toContain('Calculated subtotal')
    expect(result.warnings.join(' ')).not.toContain('IVA breakdown')
    expect(result.warnings).toContain('Lectura dudosa en nombre de producto: BIZCOCHOS PAGNIFIQUE.')
    expect(result.warnings[result.warnings.length - 1]).toContain('se ajustó a $28.00')
  })
})

describe('ReceiptScanService', () => {
  it('parses the first balanced JSON object from a Gemini response with extra explanation', async () => {
    const service = new ReceiptScanService({
      get: (key: string) => key === 'GEMINI_API_KEY' ? 'test-key' : undefined,
    } as never)
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => new Response(JSON.stringify({
      candidates: [{
        content: {
          parts: [{
            text: [
              '```json',
              '{"merchant":"ADENDA","receiptDate":"12/06/2026","currency":"UYU","total":813.21,"subtotal":841.21,"discounts":28,"paymentMethod":"MASTER","items":[],"confidence":0.9,"warnings":[]}',
              '```',
              'The discount calculation is ambiguous. Extra note: {not JSON}.',
            ].join('\n'),
          }],
        },
      }],
    }))

    try {
      const result = await service.scan(Buffer.from('fake-image'), 'image/jpeg')

      expect(result.merchant).toBe('ADENDA')
      expect(result.total).toBe(813.21)
    } finally {
      globalThis.fetch = originalFetch
    }
  })

  it('throws a friendly error when Gemini returns no parseable JSON', async () => {
    const service = new ReceiptScanService({
      get: (key: string) => key === 'GEMINI_API_KEY' ? 'test-key' : undefined,
    } as never)
    const originalFetch = globalThis.fetch
    globalThis.fetch = async () => new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'No JSON here.' }] } }],
    }))

    try {
      await expect(service.scan(Buffer.from('fake-image'), 'image/jpeg')).rejects.toThrow(BadRequestException)
    } finally {
      globalThis.fetch = originalFetch
    }
  })
})
