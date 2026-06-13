import { Injectable, NotFoundException } from '@nestjs/common'
import type { AuthenticatedUser } from '../common/guards/auth.guard'
import { PrismaService } from '../prisma/prisma.service'
import type { CreatePersonalExpenseDto } from './dto/create-personal-expense.dto'

@Injectable()
export class PersonalFinanceService {
  constructor(private prisma: PrismaService) {}

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
      include: { items: true },
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
    const profileId = await this.getProfileId(user.authUserId)
    const expenseDate = new Date(dto.date)
    const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`

    const expense = await this.prisma.personalExpense.create({
      data: {
        profileId,
        title: dto.title.trim(),
        merchant: dto.merchant?.trim() || null,
        amount: dto.amount.toFixed(2),
        date: expenseDate,
        type: dto.type,
        category: dto.category,
        notes: dto.notes?.trim() || null,
        isRecurring: dto.isRecurring ?? false,
        recurrenceDay: dto.recurrenceDay ?? null,
        monthKey,
        ...(dto.items?.length
          ? {
              items: {
                create: dto.items.map((item) => ({
                  name: item.name.trim(),
                  category: item.category,
                  quantity: (item.quantity === undefined || item.quantity === null) ? null : item.quantity.toFixed(3),
                  unitPrice: (item.unitPrice === undefined || item.unitPrice === null) ? null : item.unitPrice.toFixed(2),
                  totalPrice: item.totalPrice.toFixed(2),
                  rawLine: item.rawLine?.trim() || null,
                })),
              },
            }
          : {}),
      },
      include: { items: true },
    })

    return {
      ...expense,
      amount: Number(expense.amount),
      items: expense.items.map((item) => ({
        ...item,
        quantity: item.quantity === null ? null : Number(item.quantity),
        unitPrice: item.unitPrice === null ? null : Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
      })),
    }
  }

  async getSummary(user: AuthenticatedUser, monthKey: string) {
    const profileId = await this.getProfileId(user.authUserId)

    const expenses = await this.prisma.personalExpense.findMany({
      where: { profileId, monthKey },
      select: { amount: true, type: true, category: true },
    })

    let total = 0
    let fixed = 0
    let variable = 0
    let supermarket = 0
    const byCategory: Record<string, number> = {}

    for (const e of expenses) {
      const amt = Number(e.amount)
      total += amt
      byCategory[e.category] = (byCategory[e.category] ?? 0) + amt

      if (e.type === 'fixed') fixed += amt
      else if (e.type === 'supermarket') supermarket += amt
      else variable += amt
    }

    return { total, fixed, variable, supermarket, count: expenses.length, byCategory }
  }

  async getProductRanking(user: AuthenticatedUser, monthKey: string) {
    const profileId = await this.getProfileId(user.authUserId)

    const items = await this.prisma.personalExpenseItem.findMany({
      where: {
        expense: { profileId, monthKey },
      },
      select: { name: true, quantity: true, totalPrice: true },
    })

    type Acc = Record<string, { name: string; count: number; totalQuantity: number; totalSpent: number }>
    const grouped = items.reduce<Acc>((acc, item) => {
      const key = item.name.toLowerCase().trim().replace(/\s+/g, ' ')
      if (!acc[key]) {
        acc[key] = { name: item.name, count: 0, totalQuantity: 0, totalSpent: 0 }
      }
      acc[key].count += 1
      acc[key].totalQuantity += item.quantity === null ? 1 : Number(item.quantity)
      acc[key].totalSpent += Number(item.totalPrice)
      return acc
    }, {})

    return Object.values(grouped)
      .map((g) => ({ ...g, totalSpent: Math.round(g.totalSpent * 100) / 100 }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
  }
}
