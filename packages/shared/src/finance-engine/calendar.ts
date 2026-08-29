export const daysInMonth = (year: number, month: number) => new Date(Date.UTC(year, month, 0)).getUTCDate()
export const clampDay = (year: number, month: number, day: number) => Math.min(day, daysInMonth(year, month))
export const monthBounds = (date: string, _timeZone = 'America/Montevideo') => { const [y, m] = date.slice(0, 7).split('-').map(Number) as [number, number]; return { start: `${y}-${String(m).padStart(2, '0')}-01`, end: `${y}-${String(m).padStart(2, '0')}-${daysInMonth(y, m)}` } }
export const addMonthsPreservingDay = (date: string, months: number, originalDay = Number(date.slice(8, 10))) => { const d = new Date(`${date.slice(0, 7)}-01T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + months); const y = d.getUTCFullYear(), m = d.getUTCMonth() + 1; return `${y}-${String(m).padStart(2, '0')}-${String(clampDay(y, m, originalDay)).padStart(2, '0')}` }
export const windowDays = (asOf: string, window: 'today'|'weekend'|'restOfMonth') => {
  const date = asOf.slice(0, 10), day = new Date(`${date}T00:00:00Z`).getUTCDay()
  if (window === 'today') return [date]
  if (window === 'weekend') {
    if (day === 6) return [date, addDays(date, 1)]
    if (day === 0) return [date]
    const daysToSaturday = 6 - day
    return [addDays(date, daysToSaturday), addDays(date, daysToSaturday + 1)]
  }
  return [date, monthBounds(date).end]
}
export const addDays = (date: string, days: number) => { const d = new Date(`${date}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10) }
