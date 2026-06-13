import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import type { AuthenticatedUser } from '../common/guards/auth.guard'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateExpenseDto, CreateExpenseItemDto } from './dto/create-expense.dto'

const ROUNDING_TOLERANCE_CENTS = 5

function toCents(value: number) {
  return Math.round(value * 100)
}

function moneyFromCents(cents: number) {
  return (cents / 100).toFixed(2)
}

function moneyValue(value: number) {
  return value.toFixed(2)
}

function quantityValue(value?: number) {
  return value === undefined ? undefined : value.toFixed(3)
}

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(user: AuthenticatedUser, dto: CreateExpenseDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { authUserId: user.authUserId },
      include: {
        householdMembers: {
          include: { household: { include: { members: true } } },
          orderBy: { joinedAt: 'asc' },
        },
      },
    })

    if (!profile) {
      throw new NotFoundException('Profile not found. Use POST /profiles/ensure to create one.')
    }

    this.validateItemsTotal(dto.amount, dto.items)

    const isPersonal = dto.scope === 'personal'
    if (isPersonal) {
      return this.createPersonalExpense(profile.id, dto)
    }

    return this.createHouseholdExpense(profile, dto)
  }

  private async createPersonalExpense(profileId: string, dto: CreateExpenseDto) {
    const expenseDate = new Date(dto.date)
    const monthKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`
    const category = dto.category.trim().toLowerCase()
    const type = category.includes('súper') || category.includes('super') ? 'supermarket' : 'variable'

    const expense = await this.prisma.personalExpense.create({
      data: {
        profileId,
        title: dto.title.trim(),
        merchant: dto.merchant?.trim() || null,
        amount: moneyValue(dto.amount),
        date: expenseDate,
        type,
        category: dto.category.trim(),
        notes: dto.notes?.trim() || null,
        isRecurring: false,
        monthKey,
        items: dto.items?.length
          ? {
              create: dto.items.map((item) => ({
                name: item.name.trim(),
                quantity: quantityValue(item.quantity),
                unitPrice: item.unitPrice === undefined ? undefined : moneyValue(item.unitPrice),
                totalPrice: moneyValue(item.total),
                category: item.itemCategory,
                rawLine: item.rawText?.trim() || null,
              })),
            }
          : undefined,
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
      scope: 'personal',
    }
  }

  private async createHouseholdExpense(
    profile: { id: string; householdMembers: { householdId: string; household: { members: { profileId: string }[] } }[] },
    dto: CreateExpenseDto,
  ) {
    const membership = profile.householdMembers[0]
    if (!membership) {
      throw new BadRequestException(
        'Todavía no tenés un Lovehold vinculado. Crea o unite a uno antes de cargar gastos compartidos.',
      )
    }

    const householdId = membership.householdId
    const categoryName = dto.category.trim()
    const expenseDate = new Date(dto.date)
    const receiptDate = dto.receiptDate ? new Date(dto.receiptDate) : expenseDate
    const amountCents = toCents(dto.amount)
    const splitProfileIds = this.getSplitProfileIds(
      profile.id,
      membership.household.members.map((member: { profileId: string }) => member.profileId),
    )

    const expense = await this.prisma.$transaction(async (tx) => {
      const existingCategory = await tx.category.findFirst({
        where: {
          householdId,
          name: categoryName,
        },
      })

      const category = existingCategory ?? await tx.category.create({
        data: {
          householdId,
          name: categoryName,
        },
      })

      const created = await tx.expense.create({
        data: {
          householdId,
          categoryId: category.id,
          paidById: profile.id,
          createdById: profile.id,
          amount: moneyValue(dto.amount),
          description: dto.title.trim(),
          merchant: dto.merchant?.trim() || null,
          paymentMethod: dto.paymentMethod?.trim() || null,
          receiptDate,
          notes: dto.notes?.trim() || null,
          date: expenseDate,
          splitType: 'equal',
          items: dto.items?.length
            ? {
                create: dto.items.map((item) => ({
                  name: item.name.trim(),
                  itemCategory: item.itemCategory,
                  quantity: quantityValue(item.quantity),
                  unit: item.unit?.trim() || null,
                  unitPrice: item.unitPrice === undefined ? undefined : moneyValue(item.unitPrice),
                  total: moneyValue(item.total),
                  rawText: item.rawText?.trim() || null,
                })),
              }
            : undefined,
        },
      })

      const splitRows = this.buildEqualSplits(amountCents, splitProfileIds)
      await tx.expenseSplit.createMany({
        data: splitRows.map((split) => ({
          expenseId: created.id,
          profileId: split.profileId,
          amount: moneyFromCents(split.amountCents),
          percentage: split.percentage,
        })),
      })

      return tx.expense.findUniqueOrThrow({
        where: { id: created.id },
        include: {
          category: true,
          items: true,
          splits: true,
        },
      })
    })

    return {
      ...expense,
      amount: Number(expense.amount),
      items: expense.items.map((item) => ({
        ...item,
        quantity: item.quantity === null ? null : Number(item.quantity),
        unitPrice: item.unitPrice === null ? null : Number(item.unitPrice),
        total: Number(item.total),
      })),
      splits: expense.splits.map((split) => ({
        ...split,
        amount: Number(split.amount),
      })),
    }
  }

  private validateItemsTotal(amount: number, items?: CreateExpenseItemDto[]) {
    if (!items?.length) return

    const declaredCents = toCents(amount)
    const itemsCents = items.reduce((sum, item) => sum + toCents(item.total), 0)
    const differenceCents = Math.abs(itemsCents - declaredCents)

    if (differenceCents > ROUNDING_TOLERANCE_CENTS) {
      throw new BadRequestException(
        `La suma de los ítems ($${moneyFromCents(itemsCents)}) no coincide con el total declarado ($${moneyFromCents(declaredCents)}). Diferencia máxima permitida: $0.05.`,
      )
    }
  }

  private getSplitProfileIds(currentProfileId: string, householdProfileIds: string[]) {
    return Array.from(new Set([currentProfileId, ...householdProfileIds]))
  }

  private buildEqualSplits(totalCents: number, profileIds: string[]) {
    const baseAmount = Math.floor(totalCents / profileIds.length)
    const remainder = totalCents % profileIds.length
    const percentage = 100 / profileIds.length

    return profileIds.map((profileId, index) => ({
      profileId,
      amountCents: baseAmount + (index < remainder ? 1 : 0),
      percentage,
    }))
  }
}
