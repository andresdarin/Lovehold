import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ForbiddenException, BadRequestException, ServiceUnavailableException } from '@nestjs/common'
import { AiChatService } from './ai-chat.service'
import { FINNIC_PROMPT_ID } from '../prompts/finnic.prompt'

describe('AiChatService', () => {
  let service: AiChatService
  let prismaMock: any
  let geminiMock: any
  let promptRegistryMock: any

  beforeEach(() => {
    prismaMock = {
      aiConversation: {
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      aiMessage: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
    }

    geminiMock = {
      generateContent: vi.fn(),
    }

    promptRegistryMock = {
      get: vi.fn().mockReturnValue({
        systemPrompt: 'System prompt Finnic',
        generationConfig: { temperature: 0.7 },
      }),
    }

    service = new AiChatService(prismaMock, geminiMock, promptRegistryMock)
  })

  it('debe obtener o crear una conversación activa si no existe', async () => {
    prismaMock.aiConversation.findFirst.mockResolvedValue(null)
    prismaMock.aiConversation.create.mockResolvedValue({
      id: 'conv-1',
      profileId: 'profile-1',
      title: 'Charla con Finnic',
    })

    const result = await service.getOrCreateActiveConversation('profile-1')

    expect(prismaMock.aiConversation.findFirst).toHaveBeenCalledWith({
      where: { profileId: 'profile-1' },
      orderBy: { updatedAt: 'desc' },
    })
    expect(prismaMock.aiConversation.create).toHaveBeenCalled()
    expect(result.id).toBe('conv-1')
  })

  it('debe listar solo las conversaciones del usuario autenticado', async () => {
    const list = [{ id: 'c1', title: 'Conv 1' }]
    prismaMock.aiConversation.findMany.mockResolvedValue(list)

    const result = await service.listConversations('profile-1')

    expect(prismaMock.aiConversation.findMany).toHaveBeenCalledWith({
      where: { profileId: 'profile-1' },
      orderBy: { updatedAt: 'desc' },
      select: expect.any(Object),
    })
    expect(result).toBe(list)
  })

  it('debe rechazar acceso a mensajes de una conversación de otro usuario', async () => {
    prismaMock.aiConversation.findUnique.mockResolvedValue({
      id: 'conv-1',
      profileId: 'other-user',
    })

    await expect(
      service.getConversationMessages('profile-1', 'conv-1'),
    ).rejects.toThrow(ForbiddenException)
  })

  it('debe enviar mensaje, llamar a Gemini y persistir respuestas USER y ASSISTANT', async () => {
    prismaMock.aiConversation.findUnique.mockResolvedValue({
      id: 'conv-1',
      profileId: 'profile-1',
    })

    prismaMock.aiMessage.create
      .mockResolvedValueOnce({
        id: 'msg-user',
        conversationId: 'conv-1',
        role: 'USER',
        content: 'Hola Finnic',
      })
      .mockResolvedValueOnce({
        id: 'msg-assistant',
        conversationId: 'conv-1',
        role: 'ASSISTANT',
        content: '¡Hola! ¿En qué te ayudo hoy?',
      })

    prismaMock.aiMessage.findMany.mockResolvedValue([
      { id: 'msg-user', role: 'USER', content: 'Hola Finnic' },
    ])

    geminiMock.generateContent.mockResolvedValue('¡Hola! ¿En qué te ayudo hoy?')

    const result = await service.sendMessage('profile-1', 'conv-1', {
      content: 'Hola Finnic',
    })

    expect(prismaMock.aiMessage.create).toHaveBeenCalledTimes(2)
    expect(promptRegistryMock.get).toHaveBeenCalledWith(FINNIC_PROMPT_ID)
    expect(geminiMock.generateContent).toHaveBeenCalledWith({
      systemPrompt: 'System prompt Finnic',
      generationConfig: { temperature: 0.7 },
      contents: [{ role: 'user', parts: [{ text: 'Hola Finnic' }] }],
    })
    expect(result.userMessage.role).toBe('USER')
    expect(result.assistantMessage.role).toBe('ASSISTANT')
    expect(result.assistantMessage.content).toBe('¡Hola! ¿En qué te ayudo hoy?')
  })

  it('debe manejar fallo de Gemini sin romper y devolver error amigable', async () => {
    prismaMock.aiConversation.findUnique.mockResolvedValue({
      id: 'conv-1',
      profileId: 'profile-1',
    })

    prismaMock.aiMessage.create.mockResolvedValueOnce({
      id: 'msg-user',
      conversationId: 'conv-1',
      role: 'USER',
      content: 'Hola',
    })

    prismaMock.aiMessage.findMany.mockResolvedValue([
      { id: 'msg-user', role: 'USER', content: 'Hola' },
    ])

    geminiMock.generateContent.mockRejectedValue(new Error('Network error'))

    await expect(
      service.sendMessage('profile-1', 'conv-1', { content: 'Hola' }),
    ).rejects.toThrow(ServiceUnavailableException)
  })

  it('debe rechazar mensajes vacíos', async () => {
    await expect(
      service.sendMessage('profile-1', 'conv-1', { content: '   ' }),
    ).rejects.toThrow(BadRequestException)
  })
})
