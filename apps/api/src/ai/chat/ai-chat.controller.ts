import { Body, Controller, Get, Param, Post, UseGuards, NotFoundException, Logger, InternalServerErrorException } from '@nestjs/common'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { AuthGuard, type AuthenticatedUser } from '../../common/guards/auth.guard'
import { PrismaService } from '../../prisma/prisma.service'
import { AiChatService, CreateConversationDto, SendMessageDto } from './ai-chat.service'

@Controller('ai/chat')
@UseGuards(AuthGuard)
export class AiChatController {
  private readonly logger = new Logger(AiChatController.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatService: AiChatService,
  ) {}

  private async getProfileId(user: AuthenticatedUser): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { authUserId: user.authUserId },
      select: { id: true },
    })
    if (!profile) {
      this.logger.warn(`Profile not found for authUserId: ${user.authUserId}`)
      throw new NotFoundException('Perfil de usuario no encontrado.')
    }
    return profile.id
  }

  /**
   * Obtiene o inicializa la conversación activa más reciente del usuario.
   */
  @Get('active')
  async getActiveConversation(@CurrentUser() user: AuthenticatedUser) {
    try {
      this.logger.log(`Fetching active conversation for authUser: ${user.authUserId}`)
      const profileId = await this.getProfileId(user)
      return await this.chatService.getOrCreateActiveConversation(profileId)
    } catch (err: any) {
      this.logger.error(`Error in getActiveConversation: ${err.message}`, err.stack)
      if (err instanceof NotFoundException) throw err
      throw new InternalServerErrorException(err.message || 'Error al obtener conversación activa')
    }
  }

  /**
   * Lista todas las conversaciones del usuario.
   */
  @Get('conversations')
  async listConversations(@CurrentUser() user: AuthenticatedUser) {
    const profileId = await this.getProfileId(user)
    return this.chatService.listConversations(profileId)
  }

  /**
   * Crea una nueva conversación.
   */
  @Post('conversations')
  async createConversation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateConversationDto,
  ) {
    const profileId = await this.getProfileId(user)
    return this.chatService.createConversation(profileId, dto)
  }

  /**
   * Obtiene los mensajes de una conversación.
   */
  @Get('conversations/:id/messages')
  async getMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') conversationId: string,
  ) {
    const profileId = await this.getProfileId(user)
    return this.chatService.getConversationMessages(profileId, conversationId)
  }

  /**
   * Envía un mensaje a Finnic en una conversación específica.
   */
  @Post('conversations/:id/messages')
  async sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    const profileId = await this.getProfileId(user)
    return this.chatService.sendMessage(profileId, conversationId, dto)
  }
}
