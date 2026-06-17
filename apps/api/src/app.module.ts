import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { ExpensesModule } from './expenses/expenses.module'
import { ProfilesModule } from './profiles/profiles.module'
import { PersonalFinanceModule } from './personal-finance/personal-finance.module'
import { GamificationModule } from './gamification/gamification.module'
import { HealthModule } from './health/health.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ExpensesModule,
    ProfilesModule,
    PersonalFinanceModule,
    GamificationModule,
    HealthModule,
  ],
})
export class AppModule {}
