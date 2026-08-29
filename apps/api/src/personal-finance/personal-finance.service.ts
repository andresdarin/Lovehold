import { Injectable, NotFoundException } from '@nestjs/common'
import type { AuthenticatedUser } from '../common/guards/auth.guard'
import { PrismaService } from '../prisma/prisma.service'
import type { CreatePersonalExpenseDto } from './dto/create-personal-expense.dto'
import { CreateExpenseUseCase } from '../finance/application/create-expense.usecase'
import { formatMoney, parseMoney } from '@lovehold/shared'

@Injectable()
export class PersonalFinanceService {
  constructor(
    private prisma: PrismaService,
    private readonly createExpenseUseCase: CreateExpenseUseCase,
  ) {}

  private async getProfileId(authUserId: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { authUserId },
      select: { id: true },
    })
    if (!profile) {
      throw new NotFoundException('Profile not found')
    }
    return profile.id
  }

  async findByMonth(user: AuthenticatedUser, monthKey: string) {
    const profileId = await this.getProfileId(user.authUserId)

    const rows = await this.prisma.personalExpense.findMany({
      where: { profileId, monthKey },
      include: {
        items: true,
        financeAccount: { select: { id: true, name: true, type: true, currency: true } },
        destinationAccount: { select: { id: true, name: true, type: true, currency: true } },
      },
      orderBy: { date: 'desc' },
    })

    return rows.map((row) => ({
      ...row,
      amount: Number(row.amount),
      items: row.items.map((item) => ({
        ...item,
        quantity: item.quantity === null ? null : Number(item.quantity),
        unitPrice: item.unitPrice === null ? null : Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    }))
  }

  async create(user: AuthenticatedUser, dto: CreatePersonalExpenseDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { authUserId: user.authUserId },
      select: { id: true, baseCurrency: true },
    })
    if (!profile) throw new NotFoundException('Profile not found')
    const profileId = profile.id

    return this.createExpenseUseCase.execute({
      profileId,
      input: {
        title: dto.title,
        merchant: dto.merchant,
        amount: dto.amount,
        currency: dto.currency ?? profile.baseCurrency ?? 'UYU',
        date: dto.date,
        type: dto.type as 'fixed' | 'variable' | 'supermarket',
        category: dto.category,
        notes: dto.notes,
        isRecurring: dto.isRecurring,
        recurrenceDay: dto.recurrenceDay,
        financeAccountId: dto.financeAccountId,
        movementType: dto.movementType ?? 'EXPENSE',
        inputMethod: dto.inputMethod ?? 'MANUAL',
        items: dto.items?.map((item) => ({
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          rawLine: item.rawLine,
        })),
      },
      context: { source: 'web', inputMethod: dto.inputMethod ?? 'MANUAL' },
    })
  }

  async getSummary(user: AuthenticatedUser, monthKey: string) {
    const profileId = await this.getProfileId(user.authUserId)

    // Strictly filter out transfers and incomes so they never distort expenses
    const expenses = await this.prisma.personalExpense.findMany({
      where: {
        profileId,
        monthKey,
        movementType: 'EXPENSE',
      },
      select: { amount: true, type: true, category: true },
    })

    let total = 0n
    let fixed = 0n
    let variable = 0n
    let supermarket = 0n
    const byCategoryMinor: Record<string, bigint> = {}

    for (const e of expenses) {
      const amt = parseMoney(String(e.amount))
      total += amt
      byCategoryMinor[e.category] = (byCategoryMinor[e.category] ?? 0n) + amt

      if (e.type === 'fixed') fixed += amt
      else if (e.type === 'supermarket') supermarket += amt
      else variable += amt
    }

    const byCategory = Object.fromEntries(
      Object.entries(byCategoryMinor).map(([key, value]) => [key, Number(formatMoney(value))]),
    )
    return {
      total: Number(formatMoney(total)),
      fixed: Number(formatMoney(fixed)),
      variable: Number(formatMoney(variable)),
      supermarket: Number(formatMoney(supermarket)),
      count: expenses.length,
      byCategory,
    }
  }

  async getProductRanking(user: AuthenticatedUser, monthKey: string) {
    const profileId = await this.getProfileId(user.authUserId)

    const items = await this.prisma.personalExpenseItem.findMany({
      where: {
        expense: { profileId, monthKey, movementType: 'EXPENSE' },
      },
      select: { name: true, quantity: true, totalPrice: true },
    })

    type Acc = Record<string, { name: string; count: number; totalQuantity: number; totalSpentMinor: bigint }>
    const grouped = items.reduce<Acc>((acc, item) => {
      const key = item.name.toLowerCase().trim().replace(/\s+/g, ' ')
      if (!acc[key]) {
        acc[key] = { name: item.name, count: 0, totalQuantity: 0, totalSpentMinor: 0n }
      }
      acc[key].count += 1
      acc[key].totalQuantity += item.quantity === null ? 1 : Number(item.quantity)
      acc[key].totalSpentMinor += parseMoney(String(item.totalPrice))
      return acc
    }, {})

    return Object.values(grouped)
      .map(({ totalSpentMinor, ...g }) => ({ ...g, totalSpent: Number(formatMoney(totalSpentMinor)) }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
  }
}
