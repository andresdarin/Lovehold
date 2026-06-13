const IGNORE_PATTERNS = [
  /^(rut|fecha|caja|cajero|ticket|factura|boleta|cliente|dirección|teléfono|total|subtotal|iva|descuento|vuelto|cambio|redondeo|forma de pago|efectivo|crédito|débito|tarjeta|gracias|vuelva pronto)/i,
  /^\d{6,}/,
  /^(iva|irpf|imesi)\b/i,
  /^\s*$/,
]

const PRICE_PATTERNS = [
  /(\d{1,3}(?:\.\d{3})*,\d{2})\s*$/,  // 1.234,56
  /(\d+,\d{2})\s*$/,                    // 1234,56
  /\$\s*([\d.,]+)\s*$/,                 // $ 1.234,56 or $1234
  /(\d{1,3}(?:\.\d{3})*)\s*$/,         // 1.234 (no decimal)
  /(\d+)\s*$/,                          // 1234 (no decimal)
]

const PRICE_ONLY = /^\$?\s*[\d.,]+\s*$/

function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null
  const cleaned = raw.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) ? null : n
}

function extractPrice(line: string): number | null {
  for (const pattern of PRICE_PATTERNS) {
    const match = line.match(pattern)
    if (match) {
      const price = parsePrice(match[1])
      if (price !== null && price > 0) return price
    }
  }
  return null
}

function extractName(line: string, _price: number): string {
  return line
    .replace(/\$\s*[\d.,]+\s*$/, '')
    .replace(/[\d.,]+\s*$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export interface DetectedItem {
  name: string
  quantity: number | null
  unitPrice: number | null
  totalPrice: number
  category: string
  rawLine: string
}

export interface ParseResult {
  items: DetectedItem[]
  ignored: string[]
  detectedTotal: number | null
}

export function parseReceiptText(text: string): ParseResult {
  const lines = text.split('\n')
  const items: DetectedItem[] = []
  const ignored: string[] = []
  let detectedTotal: number | null = null

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    if (IGNORE_PATTERNS.some((p) => p.test(line))) {
      ignored.push(line)
      if (/^total\b/i.test(line)) {
        const total = extractPrice(line)
        if (total !== null) detectedTotal = total
      }
      continue
    }

    if (PRICE_ONLY.test(line)) continue

    const price = extractPrice(line)
    if (price === null) {
      ignored.push(line)
      continue
    }

    const name = extractName(line, price)
    if (!name || name.length < 2) {
      ignored.push(line)
      continue
    }

    items.push({
      name,
      quantity: null,
      unitPrice: null,
      totalPrice: price,
      category: 'alimentos',
      rawLine: line,
    })
  }

  if (items.length === 0 && ignored.length > 0) {
    const lastTotal = ignored
      .filter((l) => /^total\b/i.test(l))
      .map((l) => extractPrice(l))
      .find((p): p is number => p !== null)
    detectedTotal = lastTotal ?? null
  }

  return { items, ignored, detectedTotal }
}
