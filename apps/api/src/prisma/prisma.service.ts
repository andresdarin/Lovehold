import { Injectable, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

@Injectable()
export class PrismaService extends PrismaClient {
  private readonly logger = new Logger(PrismaService.name)

  constructor() {
    const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
    const adapter = new PrismaPg(pool)
    super({ adapter })
  }
}
