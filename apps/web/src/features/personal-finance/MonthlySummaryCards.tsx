import { formatCurrency } from './constants'
import type { MonthlySummary } from './types'
export default function MonthlySummaryCards({ summary, currency = 'UYU' }: { summary: MonthlySummary; currency?: 'UYU' | 'USD' }) {
  const rows = [['Gastos fijos', summary.fixed], ['Gastos variables', summary.variable], ['Supermercado', summary.supermarket]] as const
  return <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
    <div className="flex flex-wrap items-baseline justify-between gap-3">
      <h2 className="type-section text-lg">Resumen de egresos · {currency}</h2>
      <p className="text-2xl font-semibold tabular-nums">{formatCurrency(summary.totalExpense, currency)}</p>
    </div>
    <dl className="mt-5 divide-y divide-border">{rows.map(([label, amount]) => <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
      <dt>{label}</dt><dd className="font-medium tabular-nums">{formatCurrency(amount, currency)}</dd>
    </div>)}</dl>
    <p className="mt-3 border-t border-border pt-4 text-sm text-muted-foreground">De estos egresos, {formatCurrency(summary.creditCommitted, currency)} se registraron con tarjeta de crédito. Ya están incluidos en el total.</p>
  </section>
}

