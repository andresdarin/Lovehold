import type { FinanceAccount } from '@/features/personal-finance/types'
import type { FinanceSnapshot } from '@/features/personal-finance/hooks'

export type BalanceProps = {
  accounts: FinanceAccount[]
  snapshot: FinanceSnapshot | null
  loading?: boolean
}
