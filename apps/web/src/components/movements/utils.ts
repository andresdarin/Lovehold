import { money } from '../expenses/constants'
import type { Movement } from './types'

export function formatCurrency(value: number): string {
  return money(value)
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
  const map: Record<string, string> = {
    fixed: 'Fijo',
    variable: 'Variable',
    supermarket: 'Supermercado',
    subscription: 'Suscripción',
    debt: 'Deuda',
    other: 'Otro',
  }
  return map[kind] ?? kind
}

export function scopeLabel(scope: string): string {
  return scope === 'household' ? 'Hogar' : scope === 'personal' ? 'Personal' : scope
}

export function kindColor(kind: string): string {
  const map: Record<string, string> = {
    fixed: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
    variable: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    supermarket: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    subscription: 'bg-violet-500/15 text-violet-600 dark:text-violet-400',
    debt: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    other: 'bg-gray-500/15 text-gray-600 dark:text-gray-400',
  }
  return map[kind] ?? 'bg-gray-500/15 text-gray-600 dark:text-gray-400'
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
