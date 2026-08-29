import type { FinanceAccount } from '@/features/personal-finance/types'
import type { FinanceSnapshot } from '@/features/personal-finance/hooks'

export type CurrencyTotals = { UYU: number; USD: number }
export const emptyTotals = (): CurrencyTotals => ({ UYU: 0, USD: 0 })

export function totalsFromSnapshot(snapshot: FinanceSnapshot | null, key: 'spendableByCurrency' | 'creditDebtByCurrency'): CurrencyTotals {
  const source = snapshot?.balances?.[key] ?? snapshot?.[key] ?? {}
  return { UYU: Number(source.UYU ?? 0), USD: Number(source.USD ?? 0) }
}

export function accountTotals(accounts: FinanceAccount[], includeCredit = false): CurrencyTotals {
  return accounts.filter((a) => includeCredit || a.type !== 'CREDIT').reduce((out, account) => {
    out[account.currency] += Number(account.balance) || 0
    return out
  }, emptyTotals())
}

export function money(value: number, currency: 'UYU' | 'USD') {
  return currency === 'UYU'
    ? `$${value.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `US$ ${value.toLocaleString('es-UY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function accountType(type: FinanceAccount['type']) {
  return type === 'BANK' ? 'Banco' : type === 'CREDIT' ? 'Crédito' : 'Efectivo'
}
