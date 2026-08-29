import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ServiceUnavailableException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { GeminiClient, GeminiContent } from '../client/gemini.client'
import { PromptRegistry } from '../prompts/prompt.registry'
import { FINNIC_PROMPT_ID } from '../prompts/finnic.prompt'

export interface CreateConversationDto {
  title?: string
}

export interface SendMessageDto {
  content: string
}

const MAX_HISTORY_MESSAGES = 20

@Injectable()
export class AiChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly geminiClient: GeminiClient,
    private readonly promptRegistry: PromptRegistry,
  ) {}

  /**
   * Obtiene o crea la conversación principal/más reciente del usuario.
   */
  async getOrCreateActiveConversation(profileId: string) {
    let conv = await this.prisma.aiConversation.findFirst({
      where: { profileId },
      orderBy: { updatedAt: 'desc' },
    })

    if (!conv) {
      conv = await this.prisma.aiConversation.create({
        data: {
          profileId,
          title: 'Charla con Finnic',
        },
      })
    }

    return conv
  }

  /**
   * Lista las conversaciones pertenecientes al usuario autenticado.
   */
  async listConversations(profileId: string) {
    return this.prisma.aiConversation.findMany({
      where: { profileId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    })
  }

  /**
   * Crea una nueva conversación para el usuario.
   */
  async createConversation(profileId: string, dto?: CreateConversationDto) {
    return this.prisma.aiConversation.create({
      data: {
        profileId,
        title: dto?.title?.trim() || 'Nueva conversación',
      },
    })
  }

  /**
   * Obtiene los mensajes de una conversación, validando ownership estricto.
   */
  async getConversationMessages(profileId: string, conversationId: string) {
    const conversation = await this.prisma.aiConversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada')
    }

    if (conversation.profileId !== profileId) {
      throw new ForbiddenException('No tienes acceso a esta conversación')
    }

    return this.prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    })
  }

  /**
   * Envía un mensaje a Finnic, persiste USER message, consulta Gemini con contexto y persiste ASSISTANT message.
   */
  async sendMessage(profileId: string, conversationId: string, dto: SendMessageDto) {
    const text = dto.content?.trim()
    if (!text) {
      throw new BadRequestException('El mensaje no puede estar vacío')
    }

    const conversation = await this.prisma.aiConversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation) {
      throw new NotFoundException('Conversación no encontrada')
    }

    if (conversation.profileId !== profileId) {
      throw new ForbiddenException('No tienes acceso a esta conversación')
    }

    // 1. Persistir mensaje USER
    const userMessage = await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: 'USER',
        content: text,
      },
    })

    // Actualizar updatedAt de la conversación
    await this.prisma.aiConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    // 2. Recuperar contexto reciente de la conversación (últimos MAX_HISTORY_MESSAGES)
    const recentMessages = await this.prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: MAX_HISTORY_MESSAGES,
    })

    // 3. Preparar payload de mensajes para Gemini
    const contents: GeminiContent[] = recentMessages.map((m) => ({
      role: m.role === 'USER' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

    // 4. Obtener prompt del PromptRegistry
    const promptConfig = this.promptRegistry.get(FINNIC_PROMPT_ID)

    // 5. Llamar a Gemini exclusivamente mediante GeminiClient
    let assistantReply: string
    try {
      assistantReply = await this.geminiClient.generateContent({
        systemPrompt: promptConfig.systemPrompt,
        generationConfig: promptConfig.generationConfig,
        contents,
      })
    } catch (error) {
      // Si falla Gemini, no dejamos el estado inconsistente ni perdemos el mensaje del usuario;
      // guardamos una respuesta de fallback y relanzamos error amigable si corresponde o guardamos mensaje de error
      console.error('[AiChatService] Error al llamar a Gemini:', error)
      throw new ServiceUnavailableException('Finnic no pudo responder en este momento. Por favor intentá de nuevo.')
    }

    // 6. Persistir mensaje ASSISTANT
    const assistantMessage = await this.prisma.aiMessage.create({
      data: {
        conversationId,
        role: 'ASSISTANT',
        content: assistantReply,
      },
    })

    // Actualizar updatedAt de la conversación
    await this.prisma.aiConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })

    return {
      userMessage,
      assistantMessage,
    }
  }
}
