import { Injectable } from '@nestjs/common'
import { FinanceReadUseCases } from './finance-read.usecases'

@Injectable()
export class GetFinancialSnapshotUseCase {
  constructor(private readonly reads: FinanceReadUseCases) {}
  execute(profileId: string) { return this.reads.snapshot(profileId) }
}
