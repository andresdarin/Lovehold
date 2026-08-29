import { describe, expect, it, vi } from 'vitest'
import { AiController } from './ai.controller'

const user = { authUserId: 'auth-1' } as any
function subject() {
  const context: any = {
    resolveProfile: vi.fn(async () => ({ profileId: 'p1' })),
    ensureConversation: vi.fn(async () => ({ id: 'c1' })),
    assertConversationOwnership: vi.fn(),
  }
  const conversations: any = { getById: vi.fn() }
  const orchestrator: any = { run: vi.fn(async (request: any) => request), confirmPending: vi.fn(async () => ({ text: 'ok' })) }
  const pending: any = { getForConfirm: vi.fn(async () => ({ conversationId: 'c1' })), cancel: vi.fn(async () => ({ status: 'cancelled' })) }
  return { controller: new AiController(context, conversations, orchestrator, pending), context, orchestrator, pending }
}

describe('AiController Fase 3', () => {
  it('crea conversationId cuando chat no recibe uno', async () => {
    const s = subject()
    await s.controller.chat(user, { message: 'hola' } as any)
    expect(s.context.ensureConversation).toHaveBeenCalledWith('p1', undefined, 'hola')
    expect(s.orchestrator.run).toHaveBeenCalledWith({ profileId: 'p1', conversationId: 'c1', message: 'hola' })
  })

  it('verifica ownership antes de confirmar', async () => {
    const s = subject()
    await s.controller.confirmAction(user, 'a1')
    expect(s.context.assertConversationOwnership).toHaveBeenCalledWith('p1', 'c1')
    expect(s.orchestrator.confirmPending).toHaveBeenCalledWith({ profileId: 'p1', pendingActionId: 'a1' })
  })

  it('cancela la acción tras verificar ownership', async () => {
    const s = subject()
    await expect(s.controller.cancelAction(user, 'a1')).resolves.toEqual({ status: 'cancelled' })
    expect(s.context.assertConversationOwnership).toHaveBeenCalledWith('p1', 'c1')
    expect(s.pending.cancel).toHaveBeenCalledWith('p1', 'a1')
  })
})
