import { Injectable } from '@nestjs/common'
import { FinanceReadUseCases } from './finance-read.usecases'

@Injectable()
export class SimulatePurchaseUseCase {
  constructor(private readonly reads: FinanceReadUseCases) {}
  execute(profileId: string, input: unknown) { return this.reads.simulate(profileId, input) }
}
