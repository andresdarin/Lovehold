import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { AgentOrchestrator } from '../../ai/agent/agent.orchestrator'
import { AiPendingActionService } from '../../ai/pending/ai-pending-action.service'
import { WhatsAppChannelService } from '../../ai/whatsapp/whatsapp-channel.service'
import { PrismaService } from '../../prisma/prisma.service'
import { WhatsAppClient } from '../../whatsapp/whatsapp-client.service'
import type { NormalizedWhatsAppMessage } from './whatsapp-webhook.service'

const UNLINKED_MESSAGE = 'Tu número no está vinculado'
const PROCESSING_TIMEOUT_MS = 30_000

@Injectable()
export class WhatsAppInboundService {
  private readonly logger = new Logger(WhatsAppInboundService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly channel: WhatsAppChannelService,
    private readonly client: WhatsAppClient,
    private readonly orchestrator: AgentOrchestrator,
    private readonly pending: AiPendingActionService,
  ) {}

  async process(message: NormalizedWhatsAppMessage): Promise<void> {
    return this.processInbound(message)
  }

  async processInbound(input: {
    wamid: string
    from: string
    phoneNumberId: string
    text: string
    timestamp?: string
  }): Promise<void> {
    let inbound: { id: string; status: string } | undefined
    try {
      try {
        inbound = await this.prisma.whatsAppInboundMessage.create({
          data: {
            wamid: input.wamid,
            from: input.from,
            phoneNumberId: input.phoneNumberId,
            body: input.text,
            type: 'text',
            status: 'received',
          },
        })
      } catch (error) {
        if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error
        inbound = await this.prisma.whatsAppInboundMessage.findUnique({ where: { wamid: input.wamid } }) ?? undefined
        if (!inbound || inbound.status === 'completed' || inbound.status === 'processing') return
      }

      if (!inbound) return

      const claimed = await this.prisma.whatsAppInboundMessage.updateMany({
        where: { id: inbound.id, status: { in: ['received', 'failed'] } },
        data: { status: 'processing', processingStartedAt: new Date(), error: null },
      })
      if (claimed.count !== 1) return

      const result = await this.withTimeout(this.handleInbound(input, inbound.id), PROCESSING_TIMEOUT_MS)
      await this.prisma.whatsAppInboundMessage.update({
        where: { id: inbound.id },
        data: { status: 'completed', completedAt: new Date(), error: null },
      })
      this.logger.log({ event: 'whatsapp_inbound_completed', wamid: input.wamid, ...result })
    } catch (error) {
      const safeError = this.safeError(error)
      if (inbound?.id) {
        await this.prisma.whatsAppInboundMessage.update({
          where: { id: inbound.id },
          data: { status: 'failed', error: safeError, completedAt: null },
        }).catch(() => undefined)
      }
      this.logger.error({ event: 'whatsapp_inbound_processing_failed', wamid: input.wamid, error: safeError })
    }
  }

  private async handleInbound(input: {
    wamid: string; from: string; phoneNumberId: string; text: string
  }, inboundId: string): Promise<{ profileId?: string; conversationId?: string }> {
    let profileId: string
    try {
      profileId = (await this.channel.resolveProfileByPhone(input.from)).profileId
    } catch (error) {
      if (error instanceof NotFoundException || (error as { status?: number }).status === 404) {
        await this.client.sendText({ to: input.from, body: UNLINKED_MESSAGE, phoneNumberId: input.phoneNumberId })
        throw new Error('Profile not linked to WhatsApp', { cause: error })
      }
      throw error
    }

    const conversation = await this.channel.resolveConversation(profileId)
    await this.prisma.whatsAppInboundMessage.update({
      where: { id: inboundId }, data: { profileId, conversationId: conversation.id },
    })

    const normalized = input.text.trim().toLowerCase()
    const confirmation = /^s[ií]?$|^confirmar$|^no$|^cancelar$/i.test(normalized)
    const action = confirmation
      ? await this.prisma.aiPendingAction.findFirst({
        where: { conversationId: conversation.id, profileId, status: { in: ['pending', 'executing'] } },
        orderBy: { createdAt: 'desc' },
      })
      : null

    let response: { text?: string }
    if (action && /^(s[ií]?|confirmar)$/i.test(normalized)) {
      response = await this.orchestrator.confirmPending({ profileId, pendingActionId: action.id })
    } else if (action && /^(no|cancelar)$/i.test(normalized)) {
      await this.pending.cancel(profileId, action.id)
      response = { text: 'Operación cancelada.' }
    } else {
      response = await this.orchestrator.run({ profileId, conversationId: conversation.id, message: input.text })
    }

    await this.client.sendText({
      to: input.from,
      body: response.text || 'No pude generar una respuesta. Intentá de nuevo.',
      phoneNumberId: input.phoneNumberId,
    })
    return { profileId, conversationId: conversation.id }
  }

  private async withTimeout<T>(work: Promise<T>, timeoutMs: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout>
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('WhatsApp inbound processing timeout')), timeoutMs)
    })
    try { return await Promise.race([work, timeout]) } finally { clearTimeout(timer!) }
  }

  private safeError(error: unknown): string {
    return error instanceof Error ? error.message.slice(0, 500) : 'WhatsApp inbound processing failed'
  }
}
