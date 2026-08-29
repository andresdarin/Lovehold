import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class SavingsGoalService {
  constructor(private readonly prisma: PrismaService) {}
  findActive(profileId: string) { return this.prisma.savingsGoal.findMany({ where: { profileId, status: 'ACTIVE' }, orderBy: { targetDate: 'asc' } }) }
}
