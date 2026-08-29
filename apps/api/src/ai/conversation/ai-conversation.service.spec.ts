import { describe, expect, it, vi } from 'vitest'
import { AiConversationService } from './ai-conversation.service'

const conversation = (profileId = 'profile-a') => ({ id: 'conversation-1', profileId, title: 'Chat', createdAt: new Date(), updatedAt: new Date() })

function subject() {
  const messages: any[] = []
  const db: any = {
    aiConversation: {
      findUnique: vi.fn(async ({ where }: any) => where.id === 'conversation-1' ? conversation() : null),
      update: vi.fn(),
      findMany: vi.fn(async ({ where }: any) => [conversation(where.profileId)]),
    },
    aiMessage: {
      create: vi.fn(async ({ data }: any) => ({ id: `m${messages.length + 1}`, ...data, createdAt: new Date() })),
      findMany: vi.fn(async () => messages),
    },
  }
  db.aiMessage.create.mockImplementation(async ({ data }: any) => {
    const item = { id: `m${messages.length + 1}`, ...data, createdAt: new Date() }
    messages.push(item)
    return item
  })
  return { service: new AiConversationService(db), db }
}

describe('AiConversationService Fase 3', () => {
  it('persiste y recupera el historial en orden', async () => {
    const { service } = subject()
    await service.createMessage({ conversationId: 'conversation-1', role: 'USER' as any, content: 'uno' })
    await service.createMessage({ conversationId: 'conversation-1', role: 'ASSISTANT' as any, content: 'dos' })
    const result = await service.getRecentWindow('conversation-1')
    expect(result.map((message) => message.content)).toEqual(['uno', 'dos'])
  })

  it('aísla conversaciones por perfil', async () => {
    const { service } = subject()
    await expect(service.listByProfile('profile-a')).resolves.toHaveLength(1)
    await expect(service.getById('profile-b', 'conversation-1')).rejects.toThrow('acceso')
  })
})
