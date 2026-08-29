import { Module } from '@nestjs/common'
import { PersonalFinanceController } from './personal-finance.controller'
import { PersonalFinanceService } from './personal-finance.service'
import { FinanceModule } from '../finance/finance.module'

@Module({
  imports: [FinanceModule],
  controllers: [PersonalFinanceController],
  providers: [PersonalFinanceService],
})
export class PersonalFinanceModule {}
