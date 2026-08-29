import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma, Profile, WhatsAppInboundMessage, AiConversation } from '@prisma/client'
import { AiContextService } from '../context/ai-context.service'
import { AiConversationService } from '../conversation/ai-conversation.service'
import { PrismaService } from '../../prisma/prisma.service'

type InboundMessageInput = {
  wamid: string
  from: string
  phoneNumberId?: string
  body?: string
}

@Injectable()
export class WhatsAppChannelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly conversations: AiConversationService,
    private readonly context: AiContextService,
  ) {}

  async resolveProfileByPhone(from: string): Promise<{ profileId: string }> {
    const exact = await this.prisma.profile.findUnique({
      where: { whatsappPhone: from },
      select: { id: true },
    })
    if (exact) return { profileId: exact.id }

    const normalized = normalizePhone(from)
    const profiles: Pick<Profile, 'id' | 'whatsappPhone'>[] = await this.prisma.profile.findMany({
      where: { whatsappPhone: { not: null } },
      select: { id: true, whatsappPhone: true },
    })
    const match = profiles.find(
      (profile) => profile.whatsappPhone && normalizePhone(profile.whatsappPhone) === normalized,
    )
    if (match) return { profileId: match.id }

    throw new NotFoundException('Profile not linked to WhatsApp')
  }

  async resolveConversation(profileId: string): Promise<AiConversation> {
    const existing = await this.prisma.aiConversation.findFirst({
      where: { profileId, channel: 'whatsapp' },
      orderBy: { updatedAt: 'desc' },
    })
    if (existing) return existing

    const conversation = await this.conversations.ensureConversation(profileId, undefined, 'WhatsApp')
    return this.prisma.aiConversation.update({
      where: { id: conversation.id },
      data: { channel: 'whatsapp' },
    })
  }

  async getOrCreateInbound(input: InboundMessageInput): Promise<WhatsAppInboundMessage> {
    try {
      return await this.prisma.whatsAppInboundMessage.create({
        data: {
          wamid: input.wamid,
          from: input.from,
          phoneNumberId: input.phoneNumberId,
          body: input.body,
          type: 'text',
          status: 'received',
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const existing = await this.prisma.whatsAppInboundMessage.findUnique({
          where: { wamid: input.wamid },
        })
        if (existing) return existing
      }
      throw error
    }
  }
}

function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, '')
  return digits ? `+${digits}` : ''
}
