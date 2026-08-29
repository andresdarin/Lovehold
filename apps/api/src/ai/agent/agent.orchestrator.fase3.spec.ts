import { describe, expect, it, vi } from 'vitest'
import { AgentOrchestrator } from './agent.orchestrator'
import { z } from 'zod'

const prompt = { systemPrompt: 'Finnic', generationConfig: {} }
const write = { name: 'create_expense', description: 'crear gasto', risk: 'write', inputSchema: z.object({ amount: z.number() }), execute: vi.fn() }
const deps = (gemini: any, pending: any, conversations: any, executor: any = { execute: vi.fn() }) => new AgentOrchestrator(
  gemini, { has: vi.fn(() => true), get: vi.fn(() => write), getDeclarations: vi.fn(() => []) }, executor, { get: vi.fn(() => prompt) }, conversations, pending,
  { startRun: vi.fn(async () => ({ id: 'run-1' })), endRun: vi.fn(), logToolCall: vi.fn() }, { assertConversationOwnership: vi.fn() },
)

describe('AgentOrchestrator Fase 3', () => {
  it('usa la ventana persistida y no un history del DTO', async () => {
    const conversations: any = { getRecentWindow: vi.fn(async () => [{ role: 'USER', content: 'persistido' }]), createMessage: vi.fn(), touch: vi.fn() }
    const gemini = { chat: vi.fn(async () => ({ text: 'respuesta' })) }
    const result = await deps(gemini, { create: vi.fn(), getForConfirm: vi.fn() }, conversations).run({ profileId: 'p1', conversationId: 'c1', message: 'nuevo' })
    expect(result.text).toBe('respuesta')
    expect(gemini.chat.mock.calls[0][0].history).toEqual([
      { role: 'user', parts: [{ text: 'persistido' }] },
      { role: 'user', parts: [{ text: 'nuevo' }] },
    ])
  })

  it('crea la pending action con el profileId del request', async () => {
    const pending = { create: vi.fn(async () => ({ id: 'a1' })), getForConfirm: vi.fn() }
    const conversations: any = { getRecentWindow: vi.fn(async () => []), createMessage: vi.fn() }
    const result = await deps({ chat: vi.fn(async () => ({ functionCalls: [{ name: 'create_expense', args: { amount: 10 } }] })) }, pending, conversations).run({ profileId: 'profile-owner', conversationId: 'c1', message: 'registrar' })
    expect(result.pendingActionId).toBe('a1')
    expect(pending.create).toHaveBeenCalledWith(expect.objectContaining({ profileId: 'profile-owner', conversationId: 'c1' }))
  })

  it('una doble confirmación ejecuta el ToolExecutor una sola vez', async () => {
    let claimed = true
    const action = { id: 'a1', profileId: 'p1', conversationId: 'c1', toolName: 'create_expense', args: { amount: 10 }, risk: 'write' }
    const pending: any = {
      getForConfirm: vi.fn(async () => ({ ...action, status: 'pending' })),
      confirm: vi.fn(async () => { const result = { ...action, status: 'executing', claimed }; claimed = false; return result }),
      markCompleted: vi.fn(), markFailed: vi.fn(),
    }
    const executor = { execute: vi.fn(async () => ({ success: true, data: 'ok' })) }
    const conversations: any = { createMessage: vi.fn() }
    const orchestrator = deps({ chat: vi.fn(async () => ({ text: 'ok' })) }, pending, conversations, executor)
    await orchestrator.confirmPending({ profileId: 'p1', pendingActionId: 'a1' })
    await orchestrator.confirmPending({ profileId: 'p1', pendingActionId: 'a1' })
    expect(executor.execute).toHaveBeenCalledTimes(1)
  })
})
