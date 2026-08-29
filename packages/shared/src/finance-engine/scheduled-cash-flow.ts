import { addMonthsPreservingDay } from './calendar'
export const expectedDueOn = (flow: any) => flow.scheduledDueOn
export const nextDueOn = (date: string, frequency: string, dayOfMonth?: number) => frequency === 'MONTHLY' ? addMonthsPreservingDay(date, 1, dayOfMonth ?? Number(date.slice(8, 10))) : date
export const expandScheduledCashFlows = (input: any) => (input.scheduledCashFlows ?? []).slice().sort((a: any, b: any) => a.scheduledDueOn.localeCompare(b.scheduledDueOn) || a.scheduledCashFlowId.localeCompare(b.scheduledCashFlowId))
export const resolveScheduledCashFlow = (input: any) => {
  const flows = expandScheduledCashFlows(input), flow = flows.find((f: any) => f.lifecycle === 'OVERDUE' || f.lifecycle === 'PAID')
  if (!flow) return { error: 'No resolvable scheduled cash flow' }
  const expense = (input.expenses ?? []).find((e: any) => e.scheduledCashFlowId === flow.scheduledCashFlowId && e.scheduledDueOn === flow.scheduledDueOn)
  if (flow.lifecycle === 'PAID' && (!flow.personalExpenseId || !expense)) return { error: 'PAID outflow requires exactly one PersonalExpense link' }
  if (flow.lifecycle === 'PAID' && expense && (expense.amount.amount !== flow.amount.amount || expense.amount.currency !== flow.amount.currency || expense.direction !== flow.direction)) return { error: 'Existing expense does not match scheduled cash flow' }
  const schedule = (input.schedules ?? []).find((s: any) => flow.scheduledCashFlowId.startsWith(s.id))
  const next = schedule ? nextDueOn(flow.scheduledDueOn, schedule.frequency, schedule.dayOfMonth) : undefined
  return { ...flow, personalExpenseId: flow.personalExpenseId ?? expense?.id, nextDueOn: next, resolvedInOrder: flows.filter((f: any) => f.lifecycle === 'OVERDUE').slice(0, 2).map((f: any) => f.scheduledDueOn) }
}
