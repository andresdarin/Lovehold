import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from './prisma/prisma.module'
import { ExpensesModule } from './expenses/expenses.module'
import { ProfilesModule } from './profiles/profiles.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    ExpensesModule,
    ProfilesModule,
  ],
})
export class AppModule {}
