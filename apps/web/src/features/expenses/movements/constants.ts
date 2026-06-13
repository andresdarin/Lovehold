export const KIND_LABELS: Record<string, string> = {
  fixed: 'Fijo',
  variable: 'Variable',
  supermarket: 'Supermercado',
  subscription: 'Suscripción',
  debt: 'Deuda',
  other: 'Otro',
}

export const KIND_SHORT_LABELS: Record<string, string> = {
  fixed: 'Fijo mensual',
  variable: 'Variable',
  supermarket: 'Supermercado',
  subscription: 'Suscripción',
  debt: 'Deuda',
  other: 'Otro',
}

export const KIND_TONES: Record<string, string> = {
  fixed: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  variable: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700',
  supermarket: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
  subscription: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800',
  debt: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  other: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700',
}

export const SCOPE_LABELS: Record<string, string> = {
  personal: 'Personal',
  household: 'Hogar',
}

export const SCOPE_ICONS: Record<string, string> = {
  personal: 'User',
  household: 'Heart',
}

export const KIND_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'fixed', label: 'Fijo' },
  { value: 'variable', label: 'Variable' },
  { value: 'supermarket', label: 'Supermercado' },
  { value: 'subscription', label: 'Suscripción' },
  { value: 'debt', label: 'Deuda' },
  { value: 'other', label: 'Otro' },
] as const

export const SCOPE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'personal', label: 'Personal' },
  { value: 'household', label: 'Hogar' },
] as const

export const MONTH_LABELS_ES = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
] as const

const monthNames = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
] as const

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function formatMonthLabel(value: string): string {
  const [year, month] = value.split('-')
  const m = Number(month)
  if (!year || !m || m < 1 || m > 12) return value
  return `${monthNames[m - 1]} de ${year}`
}
