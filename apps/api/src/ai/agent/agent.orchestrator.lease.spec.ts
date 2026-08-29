import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { AgentOrchestrator } from './agent.orchestrator'

const action = { id: 'a1', profileId: 'p1', conversationId: 'c1', toolName: 'create_expense', args: { amount: 10 }, risk: 'write', status: 'executing' }
const make = (confirm: any, get = action) => {
  const pending = { getForConfirm: vi.fn(async () => get), confirm: vi.fn(async () => confirm), markCompleted: vi.fn(), markFailed: vi.fn() }
  const executor = { execute: vi.fn(async () => ({ success: true, data: { id: 'e1' } })) }
  const conversations = { createMessage: vi.fn(), getRecentWindow: vi.fn(async () => []), touch: vi.fn() }
  const observability = { startRun: vi.fn(async () => ({ id: 'run-1' })), endRun: vi.fn(), logToolCall: vi.fn() }
  const registry = { has: vi.fn(() => true), get: vi.fn(() => ({ name: action.toolName, risk: 'write', description: 'gasto', inputSchema: z.object({ amount: z.number() }) })), getDeclarations: vi.fn(() => []) }
  const orchestrator = new AgentOrchestrator(
    { chat: vi.fn(async () => ({ text: 'Listo' })) } as any, registry as any, executor as any,
    { get: vi.fn(() => ({ systemPrompt: 'Finnic', generationConfig: {} })) } as any, conversations as any, pending as any,
    observability as any, { assertConversationOwnership: vi.fn() } as any,
  )
  return { orchestrator, pending, executor }
}

describe('AgentOrchestrator lease recovery', () => {
  it('devuelve ocupado y no ejecuta con lease vigente', async () => {
    const s = make({ ...action, claimed: false, leaseActive: true })
    const result = await s.orchestrator.confirmPending({ profileId: 'p1', pendingActionId: 'a1' })
    expect(result.text).toBe('La operación ya está siendo procesada.'); expect(s.executor.execute).not.toHaveBeenCalled()
  })

  it('ejecuta una acción reclamada tras vencer el lease', async () => {
    const s = make({ ...action, claimed: true, leaseActive: false })
    const result = await s.orchestrator.confirmPending({ profileId: 'p1', pendingActionId: 'a1' })
    expect(s.executor.execute).toHaveBeenCalledWith({ name: 'create_expense', args: action.args }, { profileId: 'p1', pendingId: 'a1', sourceMessageId: 'a1' })
    expect(s.pending.markCompleted).toHaveBeenCalledWith('a1', expect.objectContaining({ success: true })); expect(result.toolCalls?.[0]?.success).toBe(true)
  })
})
