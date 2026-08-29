import { Injectable, NotFoundException } from '@nestjs/common'
import { CashFlowLifecycle, CashFlowDirection, Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { registerIncomeSchema, type RegisterIncomeInput } from './dto/schemas'

@Injectable()
export class RegisterIncomeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(command: { profileId: string; input: RegisterIncomeInput }) {
    const input = registerIncomeSchema.parse(command.input)
    const due = new Date(input.dueOn)
    const profile = await this.prisma.profile.findUnique({ where: { id: command.profileId }, select: { timeZone: true } })
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: profile?.timeZone ?? 'America/Montevideo' }).format(new Date())
    const isReceived = due.toISOString().slice(0, 10) <= today
    const key = input.sourceMessageId
    const existing = key ? await this.prisma.scheduledCashFlow.findUnique({ where: { profileId_sourceMessageId: { profileId: command.profileId, sourceMessageId: key } } }) : null
    if (existing) return this.output(existing, isReceived)
    try {
      return await this.prisma.$transaction(async (tx) => {
        const account = input.accountId
          ? await tx.financeAccount.findFirst({ where: { id: input.accountId, profileId: command.profileId, currency: input.currency } })
          : await tx.financeAccount.findFirst({ where: { profileId: command.profileId, currency: input.currency, isActive: true } })
        // Future income is deliberately allowed without an account and never changes balance.
        if (isReceived && !account) throw new NotFoundException('Finance account not found')
        const flow = await tx.scheduledCashFlow.create({ data: {
          profileId: command.profileId, direction: CashFlowDirection.INFLOW, amount: input.amount,
          currency: input.currency, accountId: account?.id, title: input.title,
          frequency: 'ONCE', certainty: 'CONFIRMED', scheduledDueOn: due,
          lifecycle: isReceived ? CashFlowLifecycle.RECEIVED : CashFlowLifecycle.PENDING,
          description: input.title, sourceMessageId: key,
        } })
        if (isReceived) await tx.financeAccount.update({ where: { id: account!.id }, data: { balance: { increment: input.amount } } })
        return this.output(flow, isReceived)
      })
    } catch (error) {
      // The composite key is the idempotency authority; the pre-read is only an optimization.
      if (key && error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const duplicate = await this.prisma.scheduledCashFlow.findUnique({ where: { profileId_sourceMessageId: { profileId: command.profileId, sourceMessageId: key } } })
        if (duplicate) return this.output(duplicate, isReceived)
      }
      throw error
    }
  }

  /** Legacy output adapter only; money remains exact internally. */
  private output(flow: any, received: boolean) { return { ...flow, amount: Number(flow.amount), received } }
}
