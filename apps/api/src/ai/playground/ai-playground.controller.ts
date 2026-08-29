import { Body, Controller, NotFoundException, Post, UseGuards } from '@nestjs/common'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { AuthGuard, AuthenticatedUser } from '../../common/guards/auth.guard'
import { AdminGuard } from '../../common/guards/admin.guard'
import { PrismaService } from '../../prisma/prisma.service'
import { AiPlaygroundService } from './ai-playground.service'
import { PlaygroundRequestDto } from './dto/playground.dto'

@Controller('ai/playground')
@UseGuards(AuthGuard, AdminGuard)
export class AiPlaygroundController {
  constructor(private readonly service: AiPlaygroundService, private readonly prisma: PrismaService) {}

  @Post('chat')
  async chat(@CurrentUser() user: AuthenticatedUser, @Body() dto: PlaygroundRequestDto) {
    const profile = await this.prisma.profile.findUnique({ where: { authUserId: user.authUserId }, select: { id: true } })
    if (!profile) throw new NotFoundException('Perfil de usuario no encontrado.')
    return this.service.run(profile.id, dto)
  }
}
