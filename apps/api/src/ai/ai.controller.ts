import { Body, Controller, Get, Param, Post, UseGuards, Logger } from '@nestjs/common'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { AuthGuard, type AuthenticatedUser } from '../common/guards/auth.guard'
import { AgentOrchestrator } from './agent/agent.orchestrator'
import { AiContextService } from './context/ai-context.service'
import { AiConversationService } from './conversation/ai-conversation.service'
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto'
import { AiPendingActionService } from './pending/ai-pending-action.service'

@Controller('ai')
@UseGuards(AuthGuard)
export class AiController {
  private readonly logger = new Logger(AiController.name)
  constructor(
    private readonly context: AiContextService,
    private readonly conversations: AiConversationService,
    private readonly orchestrator: AgentOrchestrator,
    private readonly pending: AiPendingActionService,
  ) {}

  @Post('chat')
  async chat(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChatRequestDto,
  ): Promise<ChatResponseDto> {
    try {
      const { profileId } = await this.context.resolveProfile(user.authUserId)
      const conversation = await this.context.ensureConversation(profileId, dto.conversationId, dto.message)
      return this.orchestrator.run({
        profileId,
        conversationId: conversation.id,
        message: dto.message,
      })
    } catch (err) {
      this.logger.error(
        `POST /ai/chat failed authUserId=${user?.authUserId} conversationId=${dto?.conversationId}: ${err instanceof Error ? err.message : String(err)}`,
        err instanceof Error ? err.stack : String(err),
      )
      throw err
    }
  }

  @Get('conversations')
  async listConversations(@CurrentUser() user: AuthenticatedUser) {
    const { profileId } = await this.context.resolveProfile(user.authUserId)
    return this.conversations.listByProfile(profileId)
  }

  @Get('conversations/:id/messages')
  async getMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') conversationId: string,
  ) {
    const { profileId } = await this.context.resolveProfile(user.authUserId)
    await this.context.assertConversationOwnership(profileId, conversationId)
    const conversation = await this.conversations.getById(profileId, conversationId)
    return Promise.all(conversation.messages.filter(message => {
      const metadata = message.metadata as Record<string, unknown> | null
      return message.role !== 'SYSTEM' && !metadata?.internal && !metadata?.functionCall && !metadata?.functionResponse
    }).map(async message => {
      const metadata = message.metadata as Record<string, unknown> | null
      if (typeof metadata?.pendingActionId !== 'string') return message
      const action = await this.pending.getForConfirm(profileId, metadata.pendingActionId)
      const status = action.status === 'pending' && action.expiresAt <= new Date() ? 'expired' : action.status
      return { ...message, metadata: { ...metadata, actionStatus: status } }
    }))
  }

  @Post('actions/:id/confirm')
  async confirmAction(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const { profileId } = await this.context.resolveProfile(user.authUserId)
    const action = await this.pending.getForConfirm(profileId, id)
    await this.context.assertConversationOwnership(profileId, action.conversationId)
    return this.orchestrator.confirmPending({ profileId, pendingActionId: id })
  }

  @Post('actions/:id/cancel')
  async cancelAction(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const { profileId } = await this.context.resolveProfile(user.authUserId)
    const action = await this.pending.getForConfirm(profileId, id)
    await this.context.assertConversationOwnership(profileId, action.conversationId)
    const cancelled = await this.pending.cancel(profileId, id)
    return { status: cancelled.status }
  }
}
