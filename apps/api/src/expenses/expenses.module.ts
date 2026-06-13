import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { ExpensesController } from './expenses.controller'
import { ExpensesService } from './expenses.service'
import { ReceiptScanController } from './receipt-scan.controller'
import { ReceiptScanService } from './receipt-scan.service'

@Module({
  imports: [PrismaModule],
  controllers: [ExpensesController, ReceiptScanController],
  providers: [ExpensesService, ReceiptScanService],
})
export class ExpensesModule {}
