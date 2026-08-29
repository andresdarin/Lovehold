import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class FinanceAccountService {
  constructor(private readonly prisma: PrismaService) {}
  findActive(profileId: string) { return this.prisma.financeAccount.findMany({ where: { profileId } }) }
}
