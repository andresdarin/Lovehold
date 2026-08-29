export type SpendingWindow = 'today' | 'weekend' | 'restOfMonth'
export const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate()
export const addDays = (date: string, days: number) => { const d = new Date(`${date}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10) }
export const monthBounds = (date: string) => { const [year = 1970, month = 1] = date.slice(0, 7).split('-').map(Number); return { start: `${year}-${String(month).padStart(2, '0')}-01`, end: `${year}-${String(month).padStart(2, '0')}-${daysInMonth(year, month)}` } }
export const addMonthsPreservingDay = (date: string, months: number, originalDay = Number(date.slice(8, 10))) => { const d = new Date(`${date.slice(0, 7)}-01T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + months); const year = d.getUTCFullYear(), month = d.getUTCMonth() + 1; return `${year}-${String(month).padStart(2, '0')}-${String(Math.min(originalDay, daysInMonth(year, month))).padStart(2, '0')}` }
export const windowDays = (asOf: string, window: SpendingWindow) => {
  const date = asOf.slice(0, 10), day = new Date(`${date}T00:00:00Z`).getUTCDay()
  if (window === 'today') return [date]
  if (window === 'restOfMonth') { const end = monthBounds(date).end; return Array.from({ length: Number(end.slice(8)) - Number(date.slice(8)) + 1 }, (_, i) => addDays(date, i)) }
  if (day === 6) return [date, addDays(date, 1)]
  if (day === 0) return [date]
  const saturday = addDays(date, 6 - day)
  return [saturday, addDays(saturday, 1)].filter(d => d.slice(0, 7) === date.slice(0, 7))
}
