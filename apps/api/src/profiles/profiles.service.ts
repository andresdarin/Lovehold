import {
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import type { EnsureProfileDto } from './dto/ensure-profile.dto'

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async ensure(authUserId: string, email: string, dto: EnsureProfileDto) {
    const existing = await this.prisma.profile.findUnique({
      where: { authUserId },
    })

    if (existing) {
      return existing
    }

    return this.prisma.profile.create({
      data: {
        authUserId,
        email,
        displayName: dto.displayName ?? null,
        avatarUrl: dto.avatarUrl ?? null,
        color: dto.color ?? '#6366f1',
      },
    })
  }

  async findByAuthUserId(authUserId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { authUserId },
    })

    if (!profile) {
      throw new NotFoundException('Profile not found. Use POST /profiles/ensure to create one.')
    }

    return profile
  }
}
