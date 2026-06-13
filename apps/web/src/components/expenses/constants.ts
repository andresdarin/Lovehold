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

export const SAMPLE_ITEMS: Omit<ExpenseItemForm, 'localId' | 'quantity' | 'unit' | 'unitPrice'>[] = [
  { name: 'Huevos San Agustín 15 un', itemCategory: 'ALIMENTOS', total: '199.00' },
  { name: 'Papel higiénico SAK 30 mt x 16 ro', itemCategory: 'HIGIENE', total: '319.00' },
  { name: 'Cebolla colorada', itemCategory: 'VERDURAS', total: '10.01' },
  { name: 'Queso cheddar Conaprole', itemCategory: 'LACTEOS', total: '106.80' },
  { name: 'Goma en tubo Gomets', itemCategory: 'OTROS', total: '10.00' },
  { name: 'Panceta ahumada Doña Coca', itemCategory: 'CARNES_FIAMBRES', total: '146.20' },
  { name: 'Pan Bimbo artesano papa x4u', itemCategory: 'PANIFICADOS', total: '114.00' },
  { name: 'Cerveza Colina 473 ml', itemCategory: 'ALCOHOL', total: '49.00' },
  { name: 'Alfajor triple nieve Punta', itemCategory: 'SNACKS_DULCES', total: '39.00' },
  { name: 'Alfajor Portezuelo triple', itemCategory: 'SNACKS_DULCES', total: '39.00' },
  { name: 'Bolsa compostable 50x60', itemCategory: 'LIMPIEZA_HOGAR', total: '10.00' },
]
