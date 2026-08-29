import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { AiConversation, AiMessage, AiMessageRole } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

const DEFAULT_LIMIT = 20

@Injectable()
export class AiConversationService {
  constructor(private readonly prisma: PrismaService) {}

  async listByProfile(profileId: string, limit?: number): Promise<AiConversation[]> {
    return this.prisma.aiConversation.findMany({
      where: { profileId },
      orderBy: { updatedAt: 'desc' },
      take: limit ?? DEFAULT_LIMIT,
      include: { _count: { select: { messages: true } } },
    })
  }

  async getById(
    profileId: string,
    conversationId: string,
  ): Promise<AiConversation & { messages: AiMessage[] }> {
    await this.requireConversation(conversationId, profileId)
    const conversation = await this.prisma.aiConversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
    if (!conversation) throw new NotFoundException('Conversación no encontrada')
    return conversation
  }

  async createMessage(params: {
    conversationId: string
    role: AiMessageRole
    content: string
    metadata?: any
  }): Promise<AiMessage> {
    await this.requireConversation(params.conversationId)
    const message = await this.prisma.aiMessage.create({ data: params })
    await this.touch(params.conversationId)
    return message
  }

  async getRecentWindow(conversationId: string, limit?: number): Promise<AiMessage[]> {
    await this.requireConversation(conversationId)
    return this.prisma.aiMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      take: -(limit ?? DEFAULT_LIMIT),
    })
  }

  async touch(conversationId: string): Promise<void> {
    await this.requireConversation(conversationId)
    await this.prisma.aiConversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    })
  }

  private async requireConversation(conversationId: string, profileId?: string) {
    const conversation = await this.prisma.aiConversation.findUnique({
      where: { id: conversationId },
    })
    if (!conversation) throw new NotFoundException('Conversación no encontrada')
    if (profileId && conversation.profileId !== profileId) {
      throw new ForbiddenException('No tienes acceso a esta conversación')
    }
    return conversation
  }
}
