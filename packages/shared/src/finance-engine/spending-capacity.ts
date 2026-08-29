import { money } from './money'
import { protectedCapacity } from './cash-curve'
import { windowDays } from './calendar'
export const spendingCapacity = (input: any, window: 'today'|'weekend'|'restOfMonth') => { const p = protectedCapacity(input), total = p, days = windowDays(input.asOf ?? '', window).length; const recommended = window === 'today' ? total / 3n : window === 'weekend' ? total * 2n / 3n : total; return { recommendedSpend: money(input.baseCurrency, recommended), protectedCapacity: money(input.baseCurrency, p), reasons: days ? [] : ['Invalid window'] } }
