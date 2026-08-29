import { Injectable } from '@nestjs/common'
import { FinanceReadUseCases } from './finance-read.usecases'

@Injectable()
export class GetUpcomingObligationsUseCase {
  constructor(private readonly reads: FinanceReadUseCases) {}
  execute(profileId: string, window = 'restOfMonth') { return this.reads.obligations(profileId, window) }
}
