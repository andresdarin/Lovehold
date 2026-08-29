import { describe, expect, it, vi, beforeEach } from 'vitest'
import { CreateExpenseUseCase } from '../application/create-expense.usecase'
import { CreateTransferUseCase } from '../application/create-transfer.usecase'
import { RegisterIncomeUseCase } from '../application/register-income.usecase'
import { PersonalFinanceService } from '../../personal-finance/personal-finance.service'

describe('Finnic Financial Movements & Account Invariants', () => {
  let accountsStore: Map<string, any>
  let expensesStore: any[]
  let cashFlowsStore: any[]

  let mockPrisma: any
  let createExpenseUseCase: CreateExpenseUseCase
  let createTransferUseCase: CreateTransferUseCase
  let registerIncomeUseCase: RegisterIncomeUseCase
  let personalFinanceService: PersonalFinanceService

  beforeEach(() => {
    accountsStore = new Map()
    expensesStore = []
    cashFlowsStore = []

    mockPrisma = {
      profile: {
        findUnique: vi.fn().mockResolvedValue({
          id: 'profile-1',
          timeZone: 'America/Montevideo',
          baseCurrency: 'UYU',
        }),
      },
      financeAccount: {
        findFirst: vi.fn().mockImplementation(({ where }: any) => {
          for (const acc of accountsStore.values()) {
            if (where.id && acc.id !== where.id) continue
            if (where.profileId && acc.profileId !== where.profileId) continue
            if (where.currency && acc.currency !== where.currency) continue
            return acc
          }
          return null
        }),
        findMany: vi.fn().mockImplementation(() => Array.from(accountsStore.values())),
        update: vi.fn().mockImplementation(({ where, data }: any) => {
          const acc = accountsStore.get(where.id)
          if (!acc) throw new Error('Not found')
          if (data.balance?.increment !== undefined) {
            acc.balance = (Number(acc.balance) + Number(data.balance.increment)).toFixed(2)
          }
          if (data.balance?.decrement !== undefined) {
            acc.balance = (Number(acc.balance) - Number(data.balance.decrement)).toFixed(2)
          }
          accountsStore.set(acc.id, { ...acc })
          return { ...acc }
        }),
      },
      personalExpense: {
        findUnique: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockImplementation(({ where }: any) => {
          return expensesStore.filter((e) => {
            if (where?.profileId && e.profileId !== where.profileId) return false
            if (where?.movementType && e.movementType !== where.movementType) return false
            return true
          })
        }),
        create: vi.fn().mockImplementation(({ data }: any) => {
          const id = `exp-${Date.now()}-${Math.random()}`
          const record = { id, ...data }
          expensesStore.push(record)
          return record
        }),
      },
      personalExpenseItem: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      scheduledCashFlow: {
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }: any) => {
          const flow = { id: `flow-${Date.now()}`, ...data }
          cashFlowsStore.push(flow)
          return flow
        }),
      },
      $transaction: vi.fn().mockImplementation((fn: any) => fn(mockPrisma)),
    }

    createExpenseUseCase = new CreateExpenseUseCase(mockPrisma)
    createTransferUseCase = new CreateTransferUseCase(mockPrisma)
    registerIncomeUseCase = new RegisterIncomeUseCase(mockPrisma)
    personalFinanceService = new PersonalFinanceService(mockPrisma, createExpenseUseCase)
  })

  it('Scenario 1 (CASH): Expense of $300 decrements cash from $1000 to $700 and sums $300 to monthly expenses', async () => {
    // Arrange Cash Account with $1000
    accountsStore.set('cash-1', {
      id: 'cash-1',
      profileId: 'profile-1',
      name: 'Efectivo',
      type: 'CASH',
      currency: 'UYU',
      balance: '1000.00',
      isSpendable: true,
    })

    // Act: Spend $300 in cash
    await createExpenseUseCase.execute({
      profileId: 'profile-1',
      input: {
        title: 'Verdulería',
        amount: '300.00',
        currency: 'UYU',
        date: new Date().toISOString(),
        category: 'food',
        type: 'variable',
        financeAccountId: 'cash-1',
      },
    })

    // Assert: Cash reduced to 700
    expect(Number(accountsStore.get('cash-1').balance)).toBe(700)

    // Assert: Monthly expenses summary is exactly 300
    const summary = await personalFinanceService.getSummary({ authUserId: 'u1' } as any, '2026-08')
    expect(summary.total).toBe(300)
  })

  it('Scenario 2 (DEBIT): Expense of $1200 decrements bank from $5000 to $3800 and sums $1200 to monthly expenses', async () => {
    // Arrange Bank Account with $5000
    accountsStore.set('bank-1', {
      id: 'bank-1',
      profileId: 'profile-1',
      name: 'Banco Itaú',
      type: 'BANK',
      currency: 'UYU',
      balance: '5000.00',
      isSpendable: true,
    })

    // Act: Spend $1200 via Bank
    await createExpenseUseCase.execute({
      profileId: 'profile-1',
      input: {
        title: 'Farmacia',
        amount: '1200.00',
        currency: 'UYU',
        date: new Date().toISOString(),
        category: 'health',
        type: 'variable',
        financeAccountId: 'bank-1',
      },
    })

    // Assert: Bank balance reduced to 3800
    expect(Number(accountsStore.get('bank-1').balance)).toBe(3800)

    // Assert: Monthly expenses summary is exactly 1200
    const summary = await personalFinanceService.getSummary({ authUserId: 'u1' } as any, '2026-08')
    expect(summary.total).toBe(1200)
  })

  it('Scenario 3 (CREDIT): Expense of $1200 with credit card increases card debt from $0 to $1200, leaves bank at $5000, and sums $1200 to monthly expenses', async () => {
    // Arrange Bank with $5000 and Credit Card with $0 debt
    accountsStore.set('bank-1', {
      id: 'bank-1',
      profileId: 'profile-1',
      name: 'Banco Itaú',
      type: 'BANK',
      currency: 'UYU',
      balance: '5000.00',
      isSpendable: true,
    })
    accountsStore.set('card-1', {
      id: 'card-1',
      profileId: 'profile-1',
      name: 'Visa Santander',
      type: 'CREDIT',
      currency: 'UYU',
      balance: '0.00', // Current debt = 0
      isSpendable: false,
    })

    // Act: Purchase of $1200 with Visa Santander
    await createExpenseUseCase.execute({
      profileId: 'profile-1',
      input: {
        title: 'Supermercado Disco',
        amount: '1200.00',
        currency: 'UYU',
        date: new Date().toISOString(),
        category: 'supermarket',
        type: 'supermarket',
        financeAccountId: 'card-1',
      },
    })

    // Assert: Bank balance is UNTOUCHED ($5000)
    expect(Number(accountsStore.get('bank-1').balance)).toBe(5000)

    // Assert: Card debt increased to $1200
    expect(Number(accountsStore.get('card-1').balance)).toBe(1200)

    // Assert: Monthly expenses count the $1200
    const summary = await personalFinanceService.getSummary({ authUserId: 'u1' } as any, '2026-08')
    expect(summary.total).toBe(1200)
  })

  it('Scenario 4 (CREDIT PAYMENT / TRANSFER): Paying $1200 to credit card reduces bank to $3800, clears card debt to $0, and keeps monthly expenses at $1200 (NO double counting to $2400)', async () => {
    // Arrange: Bank $5000, Card Debt $1200, Purchase of $1200 already recorded
    accountsStore.set('bank-1', {
      id: 'bank-1',
      profileId: 'profile-1',
      name: 'Banco Itaú',
      type: 'BANK',
      currency: 'UYU',
      balance: '5000.00',
      isSpendable: true,
    })
    accountsStore.set('card-1', {
      id: 'card-1',
      profileId: 'profile-1',
      name: 'Visa Santander',
      type: 'CREDIT',
      currency: 'UYU',
      balance: '1200.00',
      isSpendable: false,
    })

    // Existing purchase expense
    expensesStore.push({
      id: 'exp-purchase-1',
      profileId: 'profile-1',
      title: 'Compra Visa',
      amount: '1200.00',
      movementType: 'EXPENSE',
      type: 'variable',
      category: 'shopping',
    })

    // Act: Pay $1200 from Bank to Credit Card
    await createTransferUseCase.execute({
      profileId: 'profile-1',
      input: {
        sourceAccountId: 'bank-1',
        destinationAccountId: 'card-1',
        amount: '1200.00',
        currency: 'UYU',
        date: new Date().toISOString(),
        description: 'Pago resumen Visa',
      },
    })

    // Assert: Bank reduced to 3800
    expect(Number(accountsStore.get('bank-1').balance)).toBe(3800)

    // Assert: Card debt cleared to 0
    expect(Number(accountsStore.get('card-1').balance)).toBe(0)

    // Assert: Monthly expense remains $1200 (transfer did NOT count as a new expense!)
    const summary = await personalFinanceService.getSummary({ authUserId: 'u1' } as any, '2026-08')
    expect(summary.total).toBe(1200)
  })

  it('Scenario 5 (INCOME): Salary of $5000 deposited into Bank $3800 increases Bank to $8800 without altering expenses', async () => {
    // Arrange Bank with $3800
    accountsStore.set('bank-1', {
      id: 'bank-1',
      profileId: 'profile-1',
      name: 'Banco Itaú',
      type: 'BANK',
      currency: 'UYU',
      balance: '3800.00',
      isSpendable: true,
    })

    // Act: Register Salary Income of $5000
    await registerIncomeUseCase.execute({
      profileId: 'profile-1',
      input: {
        title: 'Sueldo',
        amount: '5000.00',
        currency: 'UYU',
        dueOn: new Date().toISOString(),
        accountId: 'bank-1',
        category: 'sueldo',
      },
    })

    // Assert: Bank balance increases to 8800
    expect(Number(accountsStore.get('bank-1').balance)).toBe(8800)

    // Assert: Income movement registered
    const incomeRecord = expensesStore.find((e) => e.movementType === 'INCOME')
    expect(incomeRecord).toBeDefined()
    expect(Number(incomeRecord.amount)).toBe(5000)

    // Assert: Expenses summary is not distorted
    const summary = await personalFinanceService.getSummary({ authUserId: 'u1' } as any, '2026-08')
    expect(summary.total).toBe(0)
  })

  it('Scenario 6 (INTERNAL TRANSFER): Transfer of $1000 from Bank $8800 to Cash $0 results in Bank $7800, Cash $1000, with 0 expense impact', async () => {
    // Arrange: Bank $8800, Cash $0
    accountsStore.set('bank-1', {
      id: 'bank-1',
      profileId: 'profile-1',
      name: 'Banco Itaú',
      type: 'BANK',
      currency: 'UYU',
      balance: '8800.00',
      isSpendable: true,
    })
    accountsStore.set('cash-1', {
      id: 'cash-1',
      profileId: 'profile-1',
      name: 'Efectivo',
      type: 'CASH',
      currency: 'UYU',
      balance: '0.00',
      isSpendable: true,
    })

    // Act: Transfer $1000 from Bank to Cash
    await createTransferUseCase.execute({
      profileId: 'profile-1',
      input: {
        sourceAccountId: 'bank-1',
        destinationAccountId: 'cash-1',
        amount: '1000.00',
        currency: 'UYU',
        date: new Date().toISOString(),
        description: 'Extracción cajero',
      },
    })

    // Assert: Balances moved correctly
    expect(Number(accountsStore.get('bank-1').balance)).toBe(7800)
    expect(Number(accountsStore.get('cash-1').balance)).toBe(1000)

    // Assert: Expense summary remains 0
    const summary = await personalFinanceService.getSummary({ authUserId: 'u1' } as any, '2026-08')
    expect(summary.total).toBe(0)
  })

  it('Scenario 7 (RECEIPT SCAN WITH CREDIT): Receipt OCR scanned $700 paid with credit card has exact same financial invariant as manual credit expense', async () => {
    // Arrange Card with $0 debt
    accountsStore.set('card-1', {
      id: 'card-1',
      profileId: 'profile-1',
      name: 'Visa Santander',
      type: 'CREDIT',
      currency: 'UYU',
      balance: '0.00',
      isSpendable: false,
    })

    // Act: Submit receipt scan with items
    await createExpenseUseCase.execute({
      profileId: 'profile-1',
      input: {
        title: 'Supermercado Devoto',
        amount: '700.00',
        currency: 'UYU',
        date: new Date().toISOString(),
        category: 'supermarket',
        type: 'supermarket',
        financeAccountId: 'card-1',
        inputMethod: 'RECEIPT_SCAN',
        items: [
          { name: 'Leche Conaprole', quantity: 2, unitPrice: 50, totalPrice: 100, category: 'alimentos' },
          { name: 'Carne Picada', quantity: 1, unitPrice: 600, totalPrice: 600, category: 'alimentos' },
        ],
      },
      context: { inputMethod: 'RECEIPT_SCAN' },
    })

    // Assert: Card debt is 700
    expect(Number(accountsStore.get('card-1').balance)).toBe(700)

    // Assert: Expense recorded with inputMethod RECEIPT_SCAN
    const expense = expensesStore[0]
    expect(expense.inputMethod).toBe('RECEIPT_SCAN')
    expect(Number(expense.amount)).toBe(700)

    // Assert: Monthly expense is 700
    const summary = await personalFinanceService.getSummary({ authUserId: 'u1' } as any, '2026-08')
    expect(summary.total).toBe(700)
  })
})
