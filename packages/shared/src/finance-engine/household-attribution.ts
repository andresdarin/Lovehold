import { parseMoney, formatMoney } from './money'
export const economicShare = (amount: string, share: string) => formatMoney(parseMoney(share) > parseMoney(amount) ? parseMoney(amount) : parseMoney(share))
