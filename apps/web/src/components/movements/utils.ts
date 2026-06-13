import { KIND_LABELS, KIND_SHORT_LABELS, KIND_TONES, SCOPE_LABELS } from './constants'
import type { Movement } from './types'

const currencyFormat = new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function formatAmount(value: number): string {
  return currencyFormat.format(value)
}

export function formatCurrency(value: number): string {
  return formatAmount(value)
}

const dateFormat = new Intl.DateTimeFormat('es-UY', { day: 'numeric', month: 'long' })
const dateFormatShort = new Intl.DateTimeFormat('es-UY', { day: 'numeric', month: 'long', year: 'numeric' })

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return dateFormatShort.format(d)
}

export function formatDateGroup(dateStr: string): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diff = today.getTime() - target.getTime()
  const days = Math.round(diff / 86400000)

  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'

  return dateFormat.format(d)
}

export function kindLabel(kind: string): string {
  return KIND_LABELS[kind] ?? kind
}

export function kindShortLabel(kind: string): string {
  return KIND_SHORT_LABELS[kind] ?? kind
}

export function kindTone(kind: string): string {
  return KIND_TONES[kind] ?? KIND_TONES.other ?? 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20'
}

export function scopeLabel(scope: string): string {
  return SCOPE_LABELS[scope] ?? scope
}

function normalize(str: string): string {
  return str.toLowerCase().trim()
}

export function movementTitleIncludesMerchant(title: string, merchant: string): boolean {
  return normalize(title).includes(normalize(merchant))
}

const GENERIC_TITLES = new Set(['compra', 'gasto', 'compra de supermercado', 'supermercado', ''])

function isGenericTitle(title: string): boolean {
  return GENERIC_TITLES.has(normalize(title))
}

export function getMovementDisplayTitle(movement: Movement): string {
  const { title, merchant, kind } = movement
  if (merchant && (!title || isGenericTitle(title) || title === merchant || movementTitleIncludesMerchant(title, merchant))) {
    return merchant
  }
  if (kind === 'supermarket' && !merchant) {
    return 'Compra de supermercado'
  }
  return title || merchant || 'Sin título'
}

export function getMovementSubtitleParts(movement: Movement): string[] {
  const displayTitle = getMovementDisplayTitle(movement)
  const parts: string[] = []
  if (movement.merchant && movement.merchant !== displayTitle && !movementTitleIncludesMerchant(displayTitle, movement.merchant)) {
    parts.push(movement.merchant)
  }
  if (movement.itemsCount > 0) {
    parts.push(`${movement.itemsCount} producto${movement.itemsCount !== 1 ? 's' : ''}`)
  }
  parts.push(scopeLabel(movement.scope))
  return parts
}

export function getMovementMetadata(movement: Movement): string {
  const parts = getMovementSubtitleParts(movement)
  return parts.length > 0 ? parts.join(' · ') : scopeLabel(movement.scope)
}

export function groupByDate(movements: Movement[]): Record<string, Movement[]> {
  const groups: Record<string, Movement[]> = {}
  for (const m of movements) {
    const key = m.date.slice(0, 10)
    if (!groups[key]) groups[key] = []
    groups[key].push(m)
  }
  return groups
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
