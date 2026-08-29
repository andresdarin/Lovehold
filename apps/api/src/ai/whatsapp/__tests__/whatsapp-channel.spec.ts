import { describe, expect, it, vi } from 'vitest'
import { WhatsAppChannelService } from '../whatsapp-channel.service'

describe('WhatsAppChannelService', () => {
  it('resuelve el profile por whatsappPhone normalizado', async () => {
    const prisma = {
      profile: {
        findUnique: vi.fn(async () => null),
        findMany: vi.fn(async () => [{ id: 'profile-1', whatsappPhone: '+598 99 123 456' }]),
      },
    }
    const service = new WhatsAppChannelService(prisma as any, {} as any, {} as any)
    await expect(service.resolveProfileByPhone('59899123456')).resolves.toEqual({ profileId: 'profile-1' })
  })

  it('reutiliza la conversación existente del canal WhatsApp', async () => {
    const conversation = { id: 'conversation-1', profileId: 'profile-1', channel: 'whatsapp' }
    const prisma = { aiConversation: { findFirst: vi.fn(async () => conversation) } }
    const service = new WhatsAppChannelService(prisma as any, {} as any, {} as any)
    const first = await service.resolveConversation('profile-1')
    const second = await service.resolveConversation('profile-1')
    expect(first).toBe(conversation)
    expect(second.id).toBe(first.id)
    expect(prisma.aiConversation.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { profileId: 'profile-1', channel: 'whatsapp' },
    }))
  })
})
