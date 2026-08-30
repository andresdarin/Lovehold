import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Prisma service managing PostgreSQL database lifecycle.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL') ?? process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured in environment')
    }
    const adapter = new PrismaPg(connectionString)
    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Prisma database client connected')
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}

