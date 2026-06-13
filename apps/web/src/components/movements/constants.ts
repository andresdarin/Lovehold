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
  fixed: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  variable: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  supermarket: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  subscription: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
  debt: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  other: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
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
