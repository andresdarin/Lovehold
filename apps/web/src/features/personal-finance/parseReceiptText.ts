const IGNORE_PATTERNS = [
  /^(rut|fecha|caja|cajero|ticket|factura|boleta|cliente|dirección|teléfono|subtotal|iva|descuento|vuelto|cambio|redondeo|forma de pago|efectivo|crédito|débito|tarjeta|gracias|vuelva pronto|le atendi)/i,
  /^\d{6,}$/, /^(iva|irpf|imesi)\b/i, /^\s*$/,
]

const SEPARATORS = [' — ', ' - ']
const PRICE_ONLY = /^\$?\s*\d[\d\s.,]*$/

function parseUruguayanPrice(raw: string): number | null {
  const cleaned = raw.replace(/[$\s]/g, '').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return isNaN(n) || n <= 0 ? null : n
}

function extractPriceFromEnd(line: string): number | null {
  const match = line.match(/(\d[\d\s.,]*)$/)
  if (!match?.[1]) return null
  return parseUruguayanPrice(match[1])
}

const CATEGORY_MAP: Record<string, string> = {
  alimentos: 'alimentos', verduras: 'alimentos', frutas: 'alimentos',
  lacteos: 'alimentos', 'lácteos': 'alimentos', carnes: 'alimentos',
  fiambres: 'alimentos', panificados: 'alimentos',
  bebidas: 'bebidas', alcohol: 'bebidas', refrescos: 'bebidas',
  limpieza: 'limpieza', hogar: 'limpieza',
  higiene: 'higiene',
  snacks: 'snacks', dulces: 'snacks', golosinas: 'snacks',
  mascotas: 'mascotas',
  farmacia: 'farmacia', salud: 'farmacia', medicamentos: 'farmacia',
  otros: 'otros_super', varios: 'otros_super',
}

function normalizeCategory(raw: string): string {
  const first = raw.replace(/\s*\/.*/, '').trim()
  const key = first.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return CATEGORY_MAP[key] ?? 'alimentos'
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
  detectedTotal: number
}

export function parseReceiptText(text: string): ParseResult {
  const lines = text.split('\n')
  const items: DetectedItem[] = []
  const ignored: string[] = []

  for (const raw of lines) {
    const line = raw.trim()
    if (!line || IGNORE_PATTERNS.some((p) => p.test(line)) || PRICE_ONLY.test(line)) {
      if (line) ignored.push(line)
      continue
    }

    let parsed = false
    for (const sep of SEPARATORS) {
      const parts = line.split(sep).map((s) => s.trim())
      if (parts.length < 2) continue

      const price = parseUruguayanPrice(parts[parts.length - 1]!)
      if (price === null) continue
      if (!parts[0]) { ignored.push(line); parsed = true; break }

      const categoryRaw = parts.length >= 3 ? parts[1]! : ''
      items.push({
        name: parts[0]!, quantity: null, unitPrice: null,
        totalPrice: price, category: categoryRaw ? normalizeCategory(categoryRaw) : 'alimentos', rawLine: line,
      })
      parsed = true
      break
    }
    if (parsed) continue

    const price = extractPriceFromEnd(line)
    if (price === null) { ignored.push(line); continue }

    const name = line.replace(/\$?\s*[\d\s.,]+$/, '').trim()
    if (!name) { ignored.push(line); continue }

    items.push({ name, quantity: null, unitPrice: null, totalPrice: price, category: 'alimentos', rawLine: line })
  }

  return { items, ignored, detectedTotal: items.reduce((s, i) => s + i.totalPrice, 0) }
}

export function normalizeProductName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ')
}
