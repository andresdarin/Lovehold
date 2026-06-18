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

    // Helper to normalize strings for comparison (remove accents, punctuation, weights, units)
    const normalizeString = (str: string): string => {
      return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove accents
        .replace(/[^a-z0-9\s]/g, '') // remove punctuation
        .replace(/\b\d+(?:g|gr|grs|kg|kgs|ml|l|cc|u|un|und|unid)\b/g, '') // remove weights/units
        .trim()
        .replace(/\s+/g, ' ')
    }

    // Step 1: Initial exact grouping of normalized names
    type RawAcc = Record<string, { originalName: string; count: number; totalQuantity: number; totalSpent: number }>
    const rawGrouped = items.reduce<RawAcc>((acc, item) => {
      const clean = normalizeString(item.name)
      if (!clean) return acc
      if (!acc[clean]) {
        acc[clean] = { originalName: item.name, count: 0, totalQuantity: 0, totalSpent: 0 }
      }
      acc[clean].count += 1
      acc[clean].totalQuantity += item.quantity === null ? 1 : Number(item.quantity)
      acc[clean].totalSpent += Number(item.totalPrice)
      return acc
    }, {})

    // Step 2: Merge subsets (e.g. "jamon dona coca et negra" into "jamon dona coca")
    const sortedKeys = Object.keys(rawGrouped).sort((a, b) => a.length - b.length)
    const finalGrouped: Record<string, { name: string; count: number; totalQuantity: number; totalSpent: number }> = {}

    for (const key of sortedKeys) {
      const data = rawGrouped[key]
      if (!data) continue
      let merged = false

      for (const existingKey of Object.keys(finalGrouped)) {
        const existingWords = existingKey.split(' ')
        const currentWords = key.split(' ')
        
        // If all words of the shorter name exist in the current longer name
        const allWordsMatch = existingWords.every((word) => currentWords.includes(word))

        if (allWordsMatch && existingWords.length > 1) {
          const existing = finalGrouped[existingKey]
          if (existing) {
            existing.count += data.count
            existing.totalQuantity += data.totalQuantity
            existing.totalSpent += data.totalSpent
            merged = true
            break
          }
        }
      }

      if (!merged) {
        // Format name beautifully: capitalize first letter of each word
        const formattedName = data.originalName
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())

        finalGrouped[key] = {
          name: formattedName,
          count: data.count,
          totalQuantity: data.totalQuantity,
          totalSpent: data.totalSpent,
        }
      }
    }

    return Object.values(finalGrouped)
      .map((g) => ({ ...g, totalSpent: Math.round(g.totalSpent * 100) / 100 }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
  }
}
