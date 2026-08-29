import type { Currency, Money } from '../schemas/finance'

const VALID = /^-?\d+\.\d{2}$/
export const parseMoney = (value: string): bigint => {
  if (!VALID.test(value)) throw new Error('Money must have exactly two decimals')
  const negative = value.startsWith('-')
  const raw = negative ? value.slice(1) : value
  const [units, cents] = raw.split('.') as [string, string]
  const result = BigInt(units) * 100n + BigInt(cents)
  return negative ? -result : result
}
export const parseDecimalToMinor = parseMoney
export const formatMoney = (minor: bigint): string => {
  const negative = minor < 0n
  const absolute = negative ? -minor : minor
  return `${negative ? '-' : ''}${absolute / 100n}.${(absolute % 100n).toString().padStart(2, '0')}`
}
export const addMoney = (a: Money, b: Money): Money => { if (a.currency !== b.currency) throw new Error('Currency mismatch'); return { currency: a.currency, amount: formatMoney(parseMoney(a.amount) + parseMoney(b.amount)) } }
export const subMoney = (a: Money, b: Money): Money => addMoney(a, { currency: b.currency, amount: formatMoney(-parseMoney(b.amount)) })
export const money = (currency: Currency, minor: bigint): Money => ({ currency, amount: formatMoney(minor) })
export const minMinor = (a: bigint, b: bigint) => a < b ? a : b
export const maxMinor = (a: bigint, b: bigint) => a > b ? a : b
