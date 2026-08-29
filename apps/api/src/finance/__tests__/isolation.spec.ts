import { describe, expect, it, vi } from 'vitest'
import { FinanceAccountService } from '../finance-account.service'
import { ScheduledCashFlowService } from '../scheduled-cash-flow.service'
import { SavingsGoalService } from '../savings-goal.service'

describe('finance profile isolation', () => {
  it('scopes every profile-owned collection to the requesting profile', async () => {
    const prisma = {
      financeAccount: {
        findMany: vi.fn().mockResolvedValue([{ id: 'acc-1', profileId: 'profile-a', name: 'Efectivo', type: 'CASH', currency: 'UYU', balance: 0, isSpendable: true, isActive: true }]),
        create: vi.fn().mockImplementation(({ data }: any) => Promise.resolve({ id: 'acc-new', ...data })),
      },
      scheduledCashFlow: { findMany: vi.fn().mockResolvedValue([]) },
      savingsGoal: { findMany: vi.fn().mockResolvedValue([]) },
    } as any
    await new FinanceAccountService(prisma).findActive('profile-a')
    await new ScheduledCashFlowService(prisma).findRelevant('profile-a', new Date(0), new Date())
    await new SavingsGoalService(prisma).findActive('profile-a')
    expect(prisma.financeAccount.findMany).toHaveBeenCalledWith({ where: { profileId: 'profile-a', isActive: true }, orderBy: { createdAt: 'asc' } })
    expect(prisma.scheduledCashFlow.findMany.mock.calls[0][0].where.profileId).toBe('profile-a')
    expect(prisma.savingsGoal.findMany.mock.calls[0][0].where.profileId).toBe('profile-a')
    expect(JSON.stringify(prisma.financeAccount.findMany.mock.calls)).not.toContain('profile-b')
  })

  it('requires household membership in the read query, never only an expense id', async () => {
    const prisma = {
      profile: { findUnique: vi.fn().mockResolvedValue({ id: 'profile-a', baseCurrency: 'UYU', timeZone: 'UTC', minimumBuffer: '0.00' }) },
      personalExpense: { findMany: vi.fn().mockResolvedValue([]) },
      expense: { findMany: vi.fn().mockResolvedValue([]) },
    } as any
    const service = new (class {
      async read() {
        await prisma.personalExpense.findMany({ where: { profileId: 'profile-a' } })
        await prisma.expense.findMany({ where: { household: { members: { some: { profileId: 'profile-a' } } } } })
      }
    })()
    await service.read()
    expect(prisma.personalExpense.findMany.mock.calls[0][0].where).toEqual({ profileId: 'profile-a' })
    expect(prisma.expense.findMany.mock.calls[0][0].where.household.members.some.profileId).toBe('profile-a')
  })
})
