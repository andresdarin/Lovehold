import { Injectable } from '@nestjs/common'
import { FinanceReadUseCases } from './finance-read.usecases'

@Injectable()
export class GetSpendingCapacityUseCase {
  constructor(private readonly reads: FinanceReadUseCases) {}
  execute(profileId: string, window: 'today' | 'weekend' | 'restOfMonth' = 'today') { return this.reads.capacity(profileId, window) }
}
