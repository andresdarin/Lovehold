import { BadRequestException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { parseMoney } from '@lovehold/shared'
import { PrismaService } from '../../prisma/prisma.service'
import { createExpenseSchema, type CreateExpenseInput } from './dto/schemas'

const cents = (value: string | number) => {
  const text = String(value)
  const [units, fraction = ''] = text.split('.')
  return parseMoney(`${units}.${fraction.padEnd(2, '0').slice(0, 2)}`)
}

@Injectable()
export class CreateExpenseUseCase {
  constructor(private readonly prisma: PrismaService) {}
  async execute(command: { profileId: string; input: unknown; context?: { source?: 'web' | 'whatsapp'; sourceMessageId?: string } }) {
    const input = createExpenseSchema.parse(command.input)
    const sourceMessageId = command.context?.sourceMessageId
    const existing = sourceMessageId ? await this.prisma.personalExpense.findUnique({ where: { profileId_sourceMessageId: { profileId: command.profileId, sourceMessageId } }, include: { items: true } }) : null
    if (existing) return this.output(existing)
    const date = new Date(input.date)
    const profile = await this.prisma.profile.findUnique({ where: { id: command.profileId }, select: { timeZone: true } })
    const timeZone = profile?.timeZone ?? 'America/Montevideo'
    const monthKey = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit' }).format(date)
    if (input.items?.length) {
      const total = input.items.reduce((sum, row) => sum + cents(String(row.totalPrice ?? row.total ?? 0)), 0n)
      const difference = total - cents(input.amount)
      if ((difference < 0n ? -difference : difference) > 5n) throw new BadRequestException('La suma de los ítems no coincide con el total declarado.')
    }
    const type = input.type ?? (input.category.toLowerCase().includes('super') || input.category.toLowerCase().includes('súper') ? 'supermarket' : 'variable')
    try {
    const created = await this.prisma.$transaction(async (tx) => {
      const account = input.financeAccountId ? await tx.financeAccount.findFirst({ where: { id: input.financeAccountId, profileId: command.profileId, currency: input.currency } }) : await tx.financeAccount.findFirst({ where: { profileId: command.profileId, currency: input.currency, isActive: true } })
      const expense = await tx.personalExpense.create({ data: {
        profileId: command.profileId, title: input.title.trim(), merchant: input.merchant?.trim() || null, amount: input.amount, currency: input.currency,
        date, type, category: input.category.trim(), notes: input.notes?.trim() || null, isRecurring: input.isRecurring ?? false, recurrenceDay: input.recurrenceDay ?? null,
        monthKey, source: command.context?.source, sourceMessageId, financeAccountId: account?.id, scheduledCashFlowId: input.scheduledCashFlowId,
        scheduledDueOn: input.scheduledDueOn ? new Date(input.scheduledDueOn) : undefined,
        items: input.items?.length ? { create: input.items.map((row) => ({ name: row.name.trim(), category: row.category ?? row.itemCategory ?? 'OTROS', quantity: row.quantity?.toFixed(3), unitPrice: row.unitPrice?.toFixed(2), totalPrice: (row.totalPrice ?? row.total)!.toFixed(2), rawLine: row.rawLine ?? row.rawText ?? null })) } : undefined,
      }, include: { items: true } })
      // updatedAt is maintained by Prisma; no separate balance timestamp is
      // needed to keep the account balance transactionally consistent.
      if (account) await tx.financeAccount.update({ where: { id: account.id }, data: { balance: { decrement: input.amount } } })
      return expense
    })
    return this.output(created)
    } catch (error) {
      // The composite key is the idempotency authority; the initial read is only an optimization.
      if (sourceMessageId && error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const duplicate = await this.prisma.personalExpense.findUnique({ where: { profileId_sourceMessageId: { profileId: command.profileId, sourceMessageId } }, include: { items: true } })
        if (duplicate) return this.output(duplicate)
      }
      throw error
    }
  }
  /** Legacy output adapter only; persistence and engine values remain exact strings/bigints. */
  private output(row: any) { return { ...row, amount: Number(row.amount), items: row.items.map((item: any) => ({ ...item, quantity: item.quantity === null ? null : Number(item.quantity), unitPrice: item.unitPrice === null ? null : Number(item.unitPrice), totalPrice: Number(item.totalPrice) })) } }
}
