import type { ExpenseItemForm } from './types'

export const ITEM_CATEGORIES = [
  { value: 'ALIMENTOS', label: 'Alimentos' },
  { value: 'VERDURAS', label: 'Verduras' },
  { value: 'FRUTAS', label: 'Frutas' },
  { value: 'LACTEOS', label: 'Lácteos' },
  { value: 'CARNES_FIAMBRES', label: 'Carnes y fiambres' },
  { value: 'PANIFICADOS', label: 'Panificados' },
  { value: 'BEBIDAS', label: 'Bebidas' },
  { value: 'ALCOHOL', label: 'Alcohol' },
  { value: 'SNACKS_DULCES', label: 'Snacks y dulces' },
  { value: 'HIGIENE', label: 'Higiene' },
  { value: 'LIMPIEZA_HOGAR', label: 'Limpieza hogar' },
  { value: 'MASCOTAS', label: 'Mascotas' },
  { value: 'OTROS', label: 'Otros' },
] as const

export const EMPTY_ITEM: Omit<ExpenseItemForm, 'localId'> = {
  name: '',
  itemCategory: 'ALIMENTOS',
  quantity: '',
  unit: '',
  unitPrice: '',
  total: '',
}

export function makeItem(overrides: Partial<ExpenseItemForm> = {}): ExpenseItemForm {
  return {
    ...EMPTY_ITEM,
    ...overrides,
    localId: overrides.localId ?? `${Date.now()}-${Math.random()}`,
  }
}

export function parseAmount(value: string): number {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : 0
}

export function toCents(value: number): number {
  return Math.round(value * 100)
}

export function money(value: number): string {
  return `$${value.toFixed(2)}`
}

export function sumItems(items: ExpenseItemForm[]): number {
  return items.reduce((sum, item) => sum + parseAmount(item.total), 0)
}
