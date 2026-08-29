import { Injectable } from '@nestjs/common'
import {
  FinancialSnapshotSchema, getFinancialSnapshot, getGoalImpact, getSpendingByCategory, simulatePurchase,
  type FinancialSnapshot,
} from '@lovehold/shared'
import { FinanceReadService } from './finance-read.service'

export type AuthenticatedProfile = { id: string }

/** Application facade: persistence and FX preparation live in FinanceReadService;
 * financial formulas remain exclusively in the shared pure engine. */
@Injectable()
export class FinanceService {
  constructor(private readonly reads: FinanceReadService) {}

  async getFinancialSnapshot(profile: AuthenticatedProfile, asOf?: Date): Promise<FinancialSnapshot> {
    const input = await this.reads.buildInput(profile.id, asOf ? { asOf } : {})
    return FinancialSnapshotSchema.parse(getFinancialSnapshot(input))
  }

  async simulatePurchase(profile: AuthenticatedProfile, request: unknown) {
    const input = await this.reads.buildInput(profile.id)
    return simulatePurchase(input, request)
  }

  async getGoalImpact(profile: AuthenticatedProfile, request: unknown) {
    return getGoalImpact({ ...(await this.reads.buildInput(profile.id)), ...(request as object) })
  }

  async getSpendingByCategory(profile: AuthenticatedProfile, from: Date, to: Date) {
    const input = await this.reads.buildInput(profile.id, { from, to })
    return getSpendingByCategory({ ...input, profileId: profile.id, from: from.toISOString(), to: to.toISOString() })
  }
}
