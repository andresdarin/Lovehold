export const EXPENSE_TYPES = [
  { value: 'fixed', label: 'Fijo', description: 'Alquiler, UTE, OSE, internet...' },
  { value: 'variable', label: 'Variable', description: 'Delivery, transporte, salud...' },
  { value: 'supermarket', label: 'Supermercado', description: 'Compra con detalle por ítem' },
] as const

export const FIXED_CATEGORIES = [
  { value: 'alquiler', label: 'Alquiler' },
  { value: 'ute', label: 'UTE' },
  { value: 'ose', label: 'OSE' },
  { value: 'antel', label: 'Antel' },
  { value: 'internet', label: 'Internet' },
  { value: 'gastos_comunes', label: 'Gastos Comunes' },
  { value: 'otros_fijos', label: 'Otros' },
] as const

export const VARIABLE_CATEGORIES = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'salud', label: 'Salud' },
  { value: 'ocio', label: 'Ocio' },
  { value: 'mascotas', label: 'Mascotas' },
  { value: 'compras', label: 'Compras' },
  { value: 'otros_variables', label: 'Otros' },
] as const

export const SUPERMARKET_ITEM_CATEGORIES = [
  { value: 'alimentos', label: 'Alimentos' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'limpieza', label: 'Limpieza' },
  { value: 'higiene', label: 'Higiene' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'mascotas', label: 'Mascotas' },
  { value: 'farmacia', label: 'Farmacia' },
  { value: 'otros_super', label: 'Otros' },
] as const

export const CATEGORY_LABELS: Record<string, string> = {
  alquiler: 'Alquiler',
  ute: 'UTE',
  ose: 'OSE',
  antel: 'Antel',
  internet: 'Internet',
  gastos_comunes: 'Gastos Comunes',
  otros_fijos: 'Otros',
  delivery: 'Delivery',
  transporte: 'Transporte',
  salud: 'Salud',
  ocio: 'Ocio',
  mascotas: 'Mascotas',
  compras: 'Compras',
  otros_variables: 'Otros',
  alimentos: 'Alimentos',
  bebidas: 'Bebidas',
  limpieza: 'Limpieza',
  higiene: 'Higiene',
  snacks: 'Snacks',
  farmacia: 'Farmacia',
  otros_super: 'Otros',
  supermercado: 'Supermercado',
}

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function monthLabel(monthKey: string): string {
  const parts = monthKey.split('-')
  const y = parts[0] ?? ''
  const idx = parseInt(parts[1] ?? '0') - 1
  return `${MONTH_NAMES[idx] ?? ''} ${y}`
}

export function currentMonthKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function formatCurrency(n: number): string {
  return `$${n.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('es-UY', { day: 'numeric', month: 'short' })
}
