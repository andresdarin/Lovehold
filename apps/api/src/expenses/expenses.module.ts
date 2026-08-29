import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { ExpensesController } from './expenses.controller'
import { FinanceModule } from '../finance/finance.module'
import { ExpensesService } from './expenses.service'
import { ReceiptScanController } from './receipt-scan.controller'
import { ReceiptScanService } from './receipt-scan.service'

@Module({
  imports: [PrismaModule, FinanceModule],
  controllers: [ExpensesController, ReceiptScanController],
  providers: [ExpensesService, ReceiptScanService],
})
export class ExpensesModule {}
