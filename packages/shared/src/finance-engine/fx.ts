import type { Currency, FxQuote, Money } from '../schemas/finance'
import { money, parseMoney } from './money'

const rate = (value: string) => parseMoney(value)
const floorDiv = (a: bigint, b: bigint) => a >= 0n ? a / b : -((-a + b - 1n) / b)
const ceilDiv = (a: bigint, b: bigint) => a >= 0n ? (a + b - 1n) / b : -((-a) / b)
export const validateFxQuote = (q: FxQuote) => { if (q.baseCurrency === q.quoteCurrency) throw new Error('Currencies must differ'); if (rate(q.bid) > rate(q.ask)) throw new Error('Bid cannot exceed ask'); return q }
export const selectQuote = (quotes: FxQuote[], from: Currency, to: Currency, asOf?: string) => quotes
  .filter(q => (q.baseCurrency === from && q.quoteCurrency === to || q.baseCurrency === to && q.quoteCurrency === from) && (!asOf || q.asOf === asOf))
  .sort((a, b) => a.asOf.localeCompare(b.asOf))[0]
export const selectHistoricalQuote = (quotes: FxQuote[], from: Currency, to: Currency, transactionOn: string) => quotes
  .filter(q => (q.baseCurrency === from && q.quoteCurrency === to || q.baseCurrency === to && q.quoteCurrency === from) && q.transactionOn === transactionOn)
  .sort((a, b) => a.asOf.localeCompare(b.asOf))[0]
export const convertAssetWithBidFloor = (value: Money, to: Currency, quote: FxQuote): Money => convert(value, to, quote, false)
export const convertObligationWithAskCeil = (value: Money, to: Currency, quote: FxQuote): Money => convert(value, to, quote, true)
const convert = (value: Money, to: Currency, q: FxQuote, ceil: boolean): Money => {
  validateFxQuote(q); if (value.currency === to) return value
  const amount = parseMoney(value.amount), bid = rate(q.bid), ask = rate(q.ask)
  // Quotes are UYU per USD: selling an asset receives bid, while funding an
  // obligation pays ask. In the inverse direction the divisions are reversed.
  if (value.currency === q.baseCurrency) return money(to, ceil ? ceilDiv(amount * 100n, bid) : floorDiv(amount * 100n, ask))
  return money(to, ceil ? ceilDiv(amount * ask, 100n) : floorDiv(amount * bid, 100n))
}
export { floorDiv, ceilDiv }
