import { Injectable } from '@nestjs/common'
import { getFinancialSnapshot, getSpendingCapacity, simulatePurchase } from '@lovehold/shared'
import { simulatePurchaseSchema, type SimulatePurchaseInput } from './dto/schemas'
import { FinanceReadService } from '../finance-read.service'
import { localDate } from '../finance.normalizer'

const addCalendarDays = (date: string, days: number) => { const value = new Date(`${date}T00:00:00.000Z`); value.setUTCDate(value.getUTCDate() + days); return value.toISOString().slice(0, 10) }
const monthEnd = (date: string) => { const value = new Date(`${date.slice(0, 7)}-01T00:00:00.000Z`); value.setUTCMonth(value.getUTCMonth() + 1, 0); return value.toISOString().slice(0, 10) }

@Injectable()
export class FinanceReadUseCases {
  constructor(private readonly readService: FinanceReadService) {}
  async snapshot(profileId: string) { return getFinancialSnapshot(await this.input(profileId)) }
  async capacity(profileId: string, window: 'today' | 'weekend' | 'restOfMonth' = 'today') { return getSpendingCapacity(await this.input(profileId), window) }
  async simulate(profileId: string, value: unknown) { const input = simulatePurchaseSchema.parse(value); return simulatePurchase(await this.input(profileId), { purchase: { amount: input.amount, currency: input.currency } }) }
  async obligations(profileId: string, window = 'restOfMonth') {
    const input = await this.input(profileId)
    const today = localDate(input.asOf, input.timeZone)
    const end = window === 'weekend' ? addCalendarDays(today, 7) : window === 'today' ? addCalendarDays(today, 1) : monthEnd(today)
    // scheduledDueOn is already a profile-local calendar date; never use Date local setters here.
    return input.scheduledCashFlows.filter((flow: any) => flow.direction === 'OUTFLOW' && flow.lifecycle === 'PENDING' && flow.scheduledDueOn <= end).map((flow: any) => ({ ...flow, overdue: flow.scheduledDueOn < today, amount: Number(flow.amount) }))
  }
  private input(profileId: string) { return this.readService.buildInput(profileId) }
}
