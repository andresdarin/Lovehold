import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export type ScheduledCashFlowResolution = 'PAID' | 'RECEIVED' | 'SKIPPED'
export type ResolveScheduledCashFlowInput = { authUserId: string; scheduleId: string; expectedDueOn: string; resolution: ScheduledCashFlowResolution }
const dateOnly = (value: Date | string) => String(value).slice(0, 10)

@Injectable()
export class ScheduledCashFlowService {
  constructor(private readonly prisma: PrismaService) {}

  findRelevant(profileId: string, from: Date, to: Date) {
    return this.prisma.scheduledCashFlow.findMany({ where: { profileId, lifecycle: 'PENDING', scheduledDueOn: { gte: from, lte: to } }, orderBy: { scheduledDueOn: 'asc' } })
  }

  async resolve(input: ResolveScheduledCashFlowInput) {
    return this.prisma.$transaction(async (tx) => {
      const profile = await tx.profile.findUnique({ where: { authUserId: input.authUserId }, select: { id: true } })
      if (!profile) throw new NotFoundException('Profile not found')
      const flow = await tx.scheduledCashFlow.findFirst({ where: { id: input.scheduleId, profileId: profile.id } })
      if (!flow) throw new NotFoundException('Scheduled cash flow not found')
      if (flow.lifecycle !== 'PENDING') {
        if (flow.lifecycle === input.resolution) return { scheduleId: flow.id, idempotent: true, resolution: input.resolution }
        throw new ConflictException('Scheduled cash flow is not active')
      }
      if (dateOnly(flow.scheduledDueOn) !== input.expectedDueOn) throw new ConflictException('expectedDueOn does not match scheduledDueOn')
      const claimed = await tx.scheduledCashFlow.updateMany({ where: { id: flow.id, profileId: profile.id, lifecycle: 'PENDING' }, data: { lifecycle: input.resolution === 'SKIPPED' ? 'SKIPPED' : input.resolution } })
      if (claimed.count === 0) throw new ConflictException('Scheduled cash flow is not active')
      const account = await tx.financeAccount.findFirst({ where: { profileId: profile.id, currency: flow.currency as 'UYU' | 'USD', isActive: true } })
      if ((input.resolution === 'PAID' || input.resolution === 'RECEIVED') && !account) throw new BadRequestException('A finance account is required for this resolution')
      let personalExpenseId: string | undefined
      const dueOn = new Date(`${input.expectedDueOn}T00:00:00.000Z`)
      if (input.resolution === 'PAID') {
        const existing = await tx.personalExpense.findFirst({ where: { scheduledCashFlowId: flow.id, scheduledDueOn: dueOn } })
        const expense = existing ?? await tx.personalExpense.create({ data: { profileId: profile.id, title: flow.title, amount: flow.amount, currency: flow.currency, date: dueOn, type: 'fixed', category: 'OTHER', monthKey: input.expectedDueOn.slice(0, 7), scheduledCashFlowId: flow.id, scheduledDueOn: dueOn, financeAccountId: account?.id } })
        personalExpenseId = expense.id
      }
      if (account && input.resolution !== 'SKIPPED') await tx.financeAccount.update({ where: { id: account.id }, data: { balance: { increment: input.resolution === 'PAID' ? `-${String(flow.amount)}` : String(flow.amount) } } })
      await tx.scheduledCashFlow.update({ where: { id: flow.id }, data: { lastResolvedDueOn: dueOn, lastResolutionStatus: input.resolution, lastResolvedAt: new Date() } })
      return { scheduleId: flow.id, idempotent: false, resolution: input.resolution, personalExpenseId }
    })
  }
}
