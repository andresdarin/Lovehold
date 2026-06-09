import { Controller, Post, Get, UseGuards, Body } from '@nestjs/common'
import { AuthGuard } from '../common/guards/auth.guard'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '../common/guards/auth.guard'
import { ProfilesService } from './profiles.service'
import { EnsureProfileDto } from './dto/ensure-profile.dto'

@Controller()
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Post('profiles/ensure')
  @UseGuards(AuthGuard)
  async ensure(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: EnsureProfileDto
  ) {
    return this.profilesService.ensure(user.authUserId, user.email, dto)
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.profilesService.findByAuthUserId(user.authUserId)
  }
}
