import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { AiPendingActionService } from './ai-pending-action.service'
import { GoneException } from '@nestjs/common'

const args = { amount: 42 }
const definition = { name: 'write_tool', inputSchema: z.object({ amount: z.number() }) }
function subject(initial: any = {}) {
  let action: any = { id: 'action-1', profileId: 'p1', conversationId: 'c1', toolName: 'write_tool', args, risk: 'write', status: 'pending', expiresAt: new Date(Date.now() + 60_000), ...initial }
  const prisma: any = { aiPendingAction: { create: vi.fn(async ({ data }: any) => ({ ...action, ...data })), findUnique: vi.fn(async () => action), update: vi.fn(async ({ data }: any) => { action = { ...action, ...data }; return action }) }, $transaction: vi.fn(async (callback: any) => callback(prisma)) }
  const executor = { execute: vi.fn() }
  const registry: any = { has: vi.fn(() => true), get: vi.fn(() => definition) }
  return { service: new AiPendingActionService(prisma, registry), prisma, executor, get action() { return action } }
}

describe('AiPendingActionService Fase 3', () => {
  it('crea una acción pendiente sin ejecutarla', async () => {
    const s = subject(); await s.service.create({ profileId: 'p1', conversationId: 'c1', toolName: 'write_tool', args, risk: 'write' })
    expect(s.executor.execute).not.toHaveBeenCalled(); expect(s.prisma.aiPendingAction.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'pending' }) }))
  })
  it('conserva los argumentos almacenados al confirmar', async () => {
    const s = subject(); const before = await s.service.getForConfirm('p1', 'action-1'); await s.service.confirm('p1', 'action-1')
    expect(before.args).toEqual(args); expect(s.action.args).toEqual(args)
  })
  it('confirma una sola vez e idempotentemente', async () => {
    const s = subject(); const first = await s.service.confirm('p1', 'action-1'); const second = await s.service.confirm('p1', 'action-1')
    expect(first.status).toBe('executing'); expect(second.status).toBe('executing'); expect(s.prisma.aiPendingAction.update).toHaveBeenCalledTimes(1); expect(s.executor.execute).toHaveBeenCalledTimes(0)
  })
  it('no ejecuta acciones vencidas y las marca expired', async () => {
    const s = subject({ expiresAt: new Date(Date.now() - 1) }); await expect(s.service.confirm('p1', 'action-1')).rejects.toThrow('expired'); expect(s.action.status).toBe('expired'); expect(s.executor.execute).not.toHaveBeenCalled()
  })
  it('no ejecuta acciones canceladas', async () => {
    const s = subject(); await s.service.cancel('p1', 'action-1'); const result = await s.service.confirm('p1', 'action-1')
    expect(result.status).toBe('cancelled'); expect(s.executor.execute).not.toHaveBeenCalled()
  })

  it('no reclama una ejecución con lease vigente', async () => {
    const s = subject({ status: 'executing', executionLeaseUntil: new Date(Date.now() + 60_000), attempts: 1 })
    const result = await s.service.confirm('p1', 'action-1')
    expect(result).toMatchObject({ claimed: false, leaseActive: true })
    expect(s.prisma.aiPendingAction.update).not.toHaveBeenCalled()
  })

  it('reclama atómicamente un lease vencido e incrementa attempts', async () => {
    const s = subject({ status: 'executing', executionLeaseUntil: new Date(Date.now() - 1), attempts: 1 })
    s.prisma.aiPendingAction.updateMany = vi.fn(async ({ data }: any) => {
      s.action.status = data.status; s.action.attempts += 1; s.action.executionLeaseUntil = data.executionLeaseUntil; return { count: 1 }
    })
    const result = await s.service.confirm('p1', 'action-1')
    expect(result.claimed).toBe(true); expect(s.action.attempts).toBe(2)
    expect(s.prisma.aiPendingAction.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ OR: expect.arrayContaining([{ executionLeaseUntil: { lte: expect.any(Date) } }]) }),
      data: expect.objectContaining({ attempts: { increment: 1 } }),
    }))
  })

  it('limita el reclaim a MAX_ATTEMPTS y pasa la acción a failed/Gone', async () => {
    const s = subject({ status: 'executing', executionLeaseUntil: new Date(Date.now() - 1), attempts: 3 })
    s.prisma.aiPendingAction.updateMany = vi.fn(async ({ data }: any) => { Object.assign(s.action, data); return { count: 1 } })
    await expect(s.service.confirm('p1', 'action-1')).rejects.toBeInstanceOf(GoneException)
    expect(s.action.status).toBe('failed'); expect(s.prisma.aiPendingAction.updateMany).toHaveBeenCalledTimes(1)
  })

  it('markCompleted solo completa una acción que sigue executing', async () => {
    const s = subject()
    s.prisma.aiPendingAction.updateMany = vi.fn(async () => ({ count: 0 }))
    await s.service.markCompleted('action-1', { id: 'expense-1' })
    expect(s.prisma.aiPendingAction.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'action-1', status: 'executing' } }))
    expect(s.action.status).toBe('pending')
  })

  it('un retry tras crear el gasto reutiliza el gasto idempotente', async () => {
    const expense = { id: 'expense-1', amount: 42, items: [] }
    const findUnique = vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(expense)
    const create = vi.fn().mockResolvedValue(expense)
    const prisma: any = {
      personalExpense: { findUnique, create }, profile: { findUnique: vi.fn().mockResolvedValue({ timeZone: 'UTC' }) },
      $transaction: vi.fn(async (callback: any) => callback({ personalExpense: { create }, financeAccount: { findFirst: vi.fn().mockResolvedValue(null) } })),
    }
    const { CreateExpenseUseCase } = await import('../../finance/application/create-expense.usecase')
    const usecase = new CreateExpenseUseCase(prisma)
    const command = { profileId: 'p1', input: { amount: 42, currency: 'UYU', category: 'OTROS', title: 'Taxi', date: '2026-08-29T12:00:00.000Z' }, context: { sourceMessageId: 'action-1' as string } }
    await usecase.execute(command); const retry = await usecase.execute(command)
    expect(retry.id).toBe('expense-1'); expect(create).toHaveBeenCalledTimes(1)
    expect(findUnique).toHaveBeenLastCalledWith(expect.objectContaining({ where: { profileId_sourceMessageId: { profileId: 'p1', sourceMessageId: 'action-1' } } }))
  })
})
