import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { MAX_XP_PER_EVENT, XP_EVENT_LIMITS } from './ranks.constants'
import { buildGamificationProfile } from './ranks.utils'
import type { GamificationProfileResponse } from './gamification.types'

@Injectable()
export class GamificationService {
  constructor(private prisma: PrismaService) {}

  async getProfile(authUserId: string): Promise<GamificationProfileResponse> {
    const profile = await this.prisma.profile.findUnique({
      where: { authUserId },
    })

    if (!profile) {
      throw new NotFoundException('Profile not found.')
    }

    return buildGamificationProfile(profile.gamificationXp)
  }

  async addXp(
    authUserId: string,
    type: string,
    xp: number,
  ): Promise<GamificationProfileResponse> {
    if (xp < 0) {
      throw new BadRequestException('XP cannot be negative.')
    }

    if (xp > MAX_XP_PER_EVENT) {
      throw new BadRequestException(`XP per event cannot exceed ${MAX_XP_PER_EVENT}.`)
    }

    const maxForType = XP_EVENT_LIMITS[type]
    if (maxForType !== undefined && xp > maxForType) {
      throw new BadRequestException(`XP for event type "${type}" cannot exceed ${maxForType}.`)
    }

    const profile = await this.prisma.profile.findUnique({
      where: { authUserId },
    })

    if (!profile) {
      throw new NotFoundException('Profile not found.')
    }

    const updated = await this.prisma.profile.update({
      where: { id: profile.id },
      data: {
        gamificationXp: { increment: xp },
      },
    })

    return buildGamificationProfile(updated.gamificationXp)
  }
}
