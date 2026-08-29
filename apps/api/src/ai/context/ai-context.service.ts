import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { AiConversation, Profile } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class AiContextService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveProfile(authUserId: string): Promise<{ profileId: string; profile: Profile }> {
    const profile = await this.prisma.profile.findUnique({ where: { authUserId } })
    if (!profile) throw new NotFoundException('Perfil no encontrado')
    return { profileId: profile.id, profile }
  }

  async assertConversationOwnership(
    profileId: string,
    conversationId: string,
  ): Promise<AiConversation> {
    const conversation = await this.prisma.aiConversation.findUnique({
      where: { id: conversationId },
    })
    if (!conversation) throw new NotFoundException('Conversación no encontrada')
    if (conversation.profileId !== profileId) {
      throw new ForbiddenException('No tienes acceso a esta conversación')
    }
    return conversation
  }

  async ensureConversation(
    profileId: string,
    conversationId?: string,
    initialMessage?: string,
  ): Promise<AiConversation> {
    if (conversationId) return this.assertConversationOwnership(profileId, conversationId)

    const title = initialMessage?.trim().slice(0, 60) || 'Nueva conversación'
    return this.prisma.aiConversation.create({ data: { profileId, title } })
  }
}
