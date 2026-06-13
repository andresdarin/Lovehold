import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common'
import { AuthGuard } from '../common/guards/auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '../common/guards/auth.guard'
import { GamificationService } from './gamification.service'
import type { GamificationProfileResponse } from './gamification.types'

class AddXpDto {
  type!: string
  xp!: number
  sourceId!: string | null
  sourceType!: string | null
}

@Controller('gamification')
@UseGuards(AuthGuard)
export class GamificationController {
  constructor(private readonly gamificationService: GamificationService) {}

  @Get('profile')
  async getProfile(@CurrentUser() user: AuthenticatedUser): Promise<GamificationProfileResponse> {
    return this.gamificationService.getProfile(user.authUserId)
  }

  @Post('add-xp')
  async addXp(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: AddXpDto,
  ): Promise<GamificationProfileResponse> {
    return this.gamificationService.addXp(user.authUserId, dto.type, dto.xp)
  }
}
