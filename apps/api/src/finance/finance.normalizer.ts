import { expenseItemCategoryToFinanceCategory, legacyCategoryToFinanceCategory } from '@lovehold/shared'
import type { Currency } from '@lovehold/shared'

export const decimalToString = (value: unknown): string => {
  const text = String(value ?? '0')
  return /^-?\d+\.\d{2}$/.test(text) ? text : Number(text).toFixed(2)
}

/** Exact conversion used at the persistence boundary; no floating point arithmetic. */
export const decimalToMinorUnits = (value: unknown): bigint => {
  const text = decimalToString(value)
  const negative = text.startsWith('-')
  const [whole, fraction] = (negative ? text.slice(1) : text).split('.')
  const result = BigInt(whole ?? '0') * 100n + BigInt(fraction ?? '0')
  return negative ? -result : result
}

export const minorUnitsToMoney = (minor: bigint): string => {
  const negative = minor < 0n
  const absolute = negative ? -minor : minor
  return `${negative ? '-' : ''}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`
}

export const localDate = (value: Date | string, timeZone: string): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value))

export const normalizeCategory = (value?: string | null): string => {
  const raw = String(value ?? '').trim()
  const normalized = legacyCategoryToFinanceCategory(raw) ?? expenseItemCategoryToFinanceCategory(raw)
  return normalized || 'OTHER'
}

export const normalizeMoney = (amount: unknown, currency: Currency) => ({ currency, amount: minorUnitsToMoney(decimalToMinorUnits(amount)) })

/** Injectable facade for callers that prefer a normalizer object. */
export class FinanceNormalizer {
  decimalToMinorUnits(value: unknown) { return decimalToMinorUnits(value) }
  minorUnitsToMoney(value: bigint) { return minorUnitsToMoney(value) }
  localDate(value: Date | string, timeZone: string) { return localDate(value, timeZone) }
  category(value?: string | null) { return normalizeCategory(value) }
  money(amount: unknown, currency: Currency) { return normalizeMoney(amount, currency) }
}
