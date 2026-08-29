import { describe, expect, it, vi } from 'vitest'
import { WhatsAppInboundService } from '../whatsapp-inbound.service'
import { Prisma } from '@prisma/client'

const input = (wamid: string, text = 'Hola') => ({ wamid, from: '59899123456', phoneNumberId: '123', type: 'text', text })
const message = (id = 'inbound-1') => ({ id, status: 'received' })
const channel = (conversationId = 'conversation-1') => ({
  resolveProfileByPhone: vi.fn(async () => ({ profileId: 'profile-1' })),
  resolveConversation: vi.fn(async () => ({ id: conversationId })),
})

function setup(options: { conversationId?: string; pending?: any; run?: any; confirm?: any } = {}) {
  const rows = new Map<string, any>()
  const prisma: any = {
    whatsAppInboundMessage: {
      create: vi.fn(async ({ data }: any) => { const row = { ...message(`inbound-${rows.size + 1}`), ...data }; rows.set(data.wamid, row); return row }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        const row = [...rows.values()].find((candidate) => candidate.id === where.id && ['received', 'failed'].includes(candidate.status))
        if (!row) return { count: 0 }
        Object.assign(row, data); return { count: 1 }
      }),
      update: vi.fn(async ({ where, data }: any) => { const row = [...rows.values()].find((candidate) => candidate.id === where.id); Object.assign(row, data); return row }),
      findUnique: vi.fn(async ({ where }: any) => rows.get(where.wamid)),
    },
    aiPendingAction: { findFirst: vi.fn(async () => options.pending ?? null) },
  }
  const orchestrator = { run: options.run ?? vi.fn(async () => ({ text: 'Respuesta' })), confirmPending: options.confirm ?? vi.fn(async () => ({ text: 'Confirmado' })) }
  const client = { sendText: vi.fn(async () => undefined) }
  const pending = { cancel: vi.fn() }
  const service = new WhatsAppInboundService(prisma, channel(options.conversationId) as any, client as any, orchestrator as any, pending as any)
  return { service, prisma, orchestrator, client, rows }
}

describe('WhatsAppInboundService', () => {
  it('no procesa dos veces el mismo WAMID cuando la constraint UNIQUE devuelve P2002', async () => {
    const s = setup()
    s.prisma.whatsAppInboundMessage.create.mockImplementationOnce(async ({ data }: any) => { s.rows.set(data.wamid, { ...message(), ...data, status: 'received' }); return message() })
      .mockRejectedValueOnce(new Prisma.PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: '7' }))
    await s.service.process(input('wamid-duplicate'))
    await s.service.process(input('wamid-duplicate'))
    expect(s.orchestrator.run).toHaveBeenCalledTimes(1)
  })

  it('envía al AgentOrchestrator profileId, conversationId y texto correctos', async () => {
    const s = setup()
    await s.service.process(input('wamid-1', '  Registrar gasto  '))
    expect(s.orchestrator.run).toHaveBeenCalledWith({ profileId: 'profile-1', conversationId: 'conversation-1', message: '  Registrar gasto  ' })
  })

  it('envía la respuesta final por WhatsApp a from con body text', async () => {
    const s = setup({ run: vi.fn(async () => ({ text: 'Listo' })) })
    await s.service.process(input('wamid-2'))
    expect(s.client.sendText).toHaveBeenCalledWith({ to: '59899123456', body: 'Listo', phoneNumberId: '123' })
  })

  it('con write pending no ejecuta write y conserva pendingActionId', async () => {
    const run = vi.fn(async () => ({ text: '¿Confirmás?', pendingActionId: 'pending-1' }))
    const s = setup({ run })
    await s.service.process(input('wamid-3', 'registrá un gasto'))
    expect(run).toHaveBeenCalledTimes(1)
    expect(s.client.sendText).toHaveBeenCalledWith(expect.objectContaining({ body: '¿Confirmás?' }))
  })

  it('sí confirma la pending action original sin argumentos nuevos', async () => {
    const confirm = vi.fn(async () => ({ text: 'Gasto confirmado' }))
    const s = setup({ pending: { id: 'pending-original', status: 'pending' }, confirm })
    await s.service.process(input('wamid-4', 'sí'))
    expect(confirm).toHaveBeenCalledWith({ profileId: 'profile-1', pendingActionId: 'pending-original' })
    expect(s.orchestrator.run).not.toHaveBeenCalled()
  })

  it('hace idempotente la doble confirmación y no duplica create_expense', async () => {
    const sourceMessageIds = new Set<string>()
    const createExpense = vi.fn((sourceMessageId: string) => sourceMessageIds.add(sourceMessageId))
    const confirm = vi.fn()
      .mockImplementationOnce(async () => { createExpense('pending-expense'); return { text: 'Creado' } })
      .mockImplementationOnce(async () => ({ text: 'La operación ya está siendo procesada.' }))
    const s = setup({ pending: { id: 'pending-expense', status: 'pending' }, confirm })
    await s.service.process(input('wamid-5', 'sí'))
    s.prisma.aiPendingAction.findFirst.mockResolvedValue({ id: 'pending-expense', status: 'executing' })
    await s.service.process(input('wamid-6', 'sí'))
    expect(confirm).toHaveBeenNthCalledWith(1, { profileId: 'profile-1', pendingActionId: 'pending-expense' })
    expect(confirm).toHaveBeenCalledTimes(2)
    expect(createExpense).toHaveBeenCalledTimes(1)
    expect(sourceMessageIds).toEqual(new Set(['pending-expense']))
    expect(s.orchestrator.run).not.toHaveBeenCalled()
  })
})
