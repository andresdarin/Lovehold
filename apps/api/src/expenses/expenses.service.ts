import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import type { AuthenticatedUser } from '../common/guards/auth.guard'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateExpenseDto, CreateExpenseItemDto } from './dto/create-expense.dto'
import type { ExpenseListResponse, ExpenseDetailResponse } from './dto/list-expenses.dto'
import type { ListExpensesDto } from './dto/list-expenses.dto'

type PersonalExpenseWithItems = Prisma.PersonalExpenseGetPayload<{ include: { items: true } }>
type ExpenseWithItemsAndCategory = Prisma.ExpenseGetPayload<{ include: { items: true; category: true } }>

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

  async findAll(user: AuthenticatedUser, query: ListExpensesDto): Promise<ExpenseListResponse> {
    const profile = await this.prisma.profile.findUnique({
      where: { authUserId: user.authUserId },
    })

    if (!profile) {
      throw new NotFoundException('Profile not found. Use POST /profiles/ensure to create one.')
    }

    const limit = query.limit ?? 30
    const offset = query.offset ?? 0

    const personalWhere: Record<string, unknown> = {
      profileId: profile.id,
    }

    if (query.month) {
      personalWhere.monthKey = query.month
    }

    if (query.q) {
      personalWhere.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { merchant: { contains: query.q, mode: 'insensitive' } },
        { category: { contains: query.q, mode: 'insensitive' } },
        { notes: { contains: query.q, mode: 'insensitive' } },
        { items: { some: { name: { contains: query.q, mode: 'insensitive' } } } },
      ]
    }

    if (query.category) {
      personalWhere.category = query.category
    }

    if (query.kind) {
      if (['fixed', 'variable', 'supermarket'].includes(query.kind)) {
        personalWhere.type = query.kind
      } else {
        personalWhere.id = '__nonexistent__'
      }
    }

    const householdWhere: Record<string, unknown> = {
      paidById: profile.id,
    }

    if (query.month) {
      const startDate = new Date(`${query.month}-01T00:00:00.000Z`)
      const endDate = new Date(startDate)
      endDate.setUTCMonth(endDate.getUTCMonth() + 1)
      householdWhere.date = {
        gte: startDate,
        lt: endDate,
      }
    }

    if (query.q) {
      householdWhere.OR = [
        { description: { contains: query.q, mode: 'insensitive' } },
        { merchant: { contains: query.q, mode: 'insensitive' } },
        { notes: { contains: query.q, mode: 'insensitive' } },
        { category: { name: { contains: query.q, mode: 'insensitive' } } },
        { items: { some: { name: { contains: query.q, mode: 'insensitive' } } } },
      ]
    }

    if (query.category) {
      householdWhere.category = { name: query.category }
    }

    if (query.paymentMethod) {
      householdWhere.paymentMethod = query.paymentMethod
    }

    const scope = query.scope

    let personalExpenses: PersonalExpenseWithItems[] = []
    let householdExpenses: ExpenseWithItemsAndCategory[] = []

    if (!scope || scope === 'personal') {
      personalExpenses = await this.prisma.personalExpense.findMany({
        where: personalWhere as Prisma.PersonalExpenseWhereInput,
        include: { items: true },
        orderBy: { date: 'desc' },
      })
    }

    if (!scope || scope === 'household') {
      householdExpenses = await this.prisma.expense.findMany({
        where: householdWhere as Prisma.ExpenseWhereInput,
        include: { items: true, category: true },
        orderBy: { date: 'desc' },
      })
    }

    const personalMapped: ExpenseDetailResponse[] = personalExpenses.map((expense) => ({
      id: expense.id,
      title: expense.title,
      merchant: expense.merchant,
      date: expense.date.toISOString(),
      category: expense.category,
      kind: expense.type,
      scope: 'personal',
      splitStatus: 'none',
      total: Number(expense.amount),
      currency: 'UYU',
      paymentMethod: null,
      itemsCount: expense.items.length,
      itemsTotal: expense.items.reduce((sum, item) => sum + Number(item.totalPrice), 0),
      discounts: null,
      notes: expense.notes,
      isRecurring: expense.isRecurring,
      recurringLabel: expense.isRecurring ? `Cada mes el ${expense.recurrenceDay}` : null,
      items: expense.items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity ? Number(item.quantity) : null,
        unit: null,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
        totalPrice: Number(item.totalPrice),
      })),
      createdAt: expense.createdAt.toISOString(),
    }))

    const householdMapped: ExpenseDetailResponse[] = householdExpenses.map((expense) => ({
      id: expense.id,
      title: expense.description,
      merchant: expense.merchant,
      date: expense.date.toISOString(),
      category: expense.category?.name || 'Sin categoría',
      kind: 'supermarket',
      scope: 'household',
      splitStatus: expense.splitType === 'equal' ? 'split' : 'pending',
      total: Number(expense.amount),
      currency: 'UYU',
      paymentMethod: expense.paymentMethod ?? null,
      itemsCount: expense.items.length,
      itemsTotal: expense.items.reduce((sum, item) => sum + Number(item.total), 0),
      discounts: null,
      notes: expense.notes,
      isRecurring: false,
      recurringLabel: null,
      items: expense.items.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.itemCategory,
        quantity: item.quantity ? Number(item.quantity) : null,
        unit: item.unit || null,
        unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
        totalPrice: Number(item.total),
      })),
      createdAt: expense.createdAt.toISOString(),
    }))

    const merged = [...personalMapped, ...householdMapped].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )

    const totalCount = merged.length

    const paginatedItems = merged.slice(offset, offset + limit)

    const summary = {
      month: query.month || new Date().toISOString().slice(0, 7),
      totalSpent: paginatedItems.reduce((sum, i) => sum + i.total, 0),
      fixedTotal: paginatedItems.filter((i) => i.kind === 'fixed').reduce((sum, i) => sum + i.total, 0),
      variableTotal: paginatedItems.filter((i) => i.kind === 'variable').reduce((sum, i) => sum + i.total, 0),
      supermarketTotal: paginatedItems.filter((i) => i.kind === 'supermarket').reduce((sum, i) => sum + i.total, 0),
      householdTotal: paginatedItems.filter((i) => i.scope === 'household').reduce((sum, i) => sum + i.total, 0),
      personalTotal: paginatedItems.filter((i) => i.scope === 'personal').reduce((sum, i) => sum + i.total, 0),
      itemsCount: paginatedItems.length,
    }

    return {
      items: paginatedItems,
      summary,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    }
  }

  async findOne(user: AuthenticatedUser, id: string): Promise<ExpenseDetailResponse> {
    const profile = await this.prisma.profile.findUnique({
      where: { authUserId: user.authUserId },
    })

    if (!profile) {
      throw new NotFoundException('Profile not found.')
    }

    const personalExpense = await this.prisma.personalExpense.findUnique({
      where: { id },
      include: { items: true },
    })

    if (personalExpense) {
      if (personalExpense.profileId !== profile.id) {
        throw new NotFoundException('Expense not found')
      }

      return {
        id: personalExpense.id,
        title: personalExpense.title,
        merchant: personalExpense.merchant,
        date: personalExpense.date.toISOString(),
        category: personalExpense.category,
        kind: personalExpense.type,
        scope: 'personal',
        splitStatus: 'none',
        total: Number(personalExpense.amount),
        currency: 'UYU',
        paymentMethod: null,
        itemsCount: personalExpense.items.length,
        itemsTotal: personalExpense.items.reduce((sum, item) => sum + Number(item.totalPrice), 0),
        discounts: null,
        notes: personalExpense.notes,
        isRecurring: personalExpense.isRecurring,
        recurringLabel: personalExpense.isRecurring ? `Cada mes el ${personalExpense.recurrenceDay}` : null,
        items: personalExpense.items.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          quantity: item.quantity ? Number(item.quantity) : null,
          unit: null,
          unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
          totalPrice: Number(item.totalPrice),
        })),
        createdAt: personalExpense.createdAt.toISOString(),
      }
    }

    const householdExpense = await this.prisma.expense.findUnique({
      where: { id },
      include: { items: true, category: true },
    })

    if (householdExpense) {
      if (householdExpense.paidById !== profile.id) {
        throw new NotFoundException('Expense not found')
      }

      return {
        id: householdExpense.id,
        title: householdExpense.description,
        merchant: householdExpense.merchant,
        date: householdExpense.date.toISOString(),
        category: householdExpense.category?.name || 'Sin categoría',
        kind: 'supermarket',
        scope: 'household',
        splitStatus: householdExpense.splitType === 'equal' ? 'split' : 'pending',
        total: Number(householdExpense.amount),
        currency: 'UYU',
        paymentMethod: householdExpense.paymentMethod ?? null,
        itemsCount: householdExpense.items.length,
        itemsTotal: householdExpense.items.reduce((sum, item) => sum + Number(item.total), 0),
        discounts: null,
        notes: householdExpense.notes,
        isRecurring: false,
        recurringLabel: null,
        items: householdExpense.items.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.itemCategory,
          quantity: item.quantity ? Number(item.quantity) : null,
          unit: item.unit || null,
          unitPrice: item.unitPrice ? Number(item.unitPrice) : null,
          totalPrice: Number(item.total),
        })),
        createdAt: householdExpense.createdAt.toISOString(),
      }
    }

    throw new NotFoundException('Expense not found')
  }

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
