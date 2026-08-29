-- Reconcile the persisted V1.1 schema with schema.prisma.
-- This migration is additive and is safe to apply only after the prior migrations.

ALTER TABLE "Profile"
  ADD COLUMN IF NOT EXISTS "baseCurrency" "FinanceCurrency" DEFAULT 'UYU',
  ADD COLUMN IF NOT EXISTS "timeZone" TEXT DEFAULT 'America/Montevideo',
  ADD COLUMN IF NOT EXISTS "minimumBuffer" DECIMAL(18,2) DEFAULT 0;

DO $$ BEGIN
  CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "SavingsGoal" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "targetAmount" DECIMAL(18,2) NOT NULL,
  "currentAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
  "currency" "FinanceCurrency" NOT NULL,
  "targetDate" DATE NOT NULL,
  "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SavingsGoal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "SavingsGoal_profileId_status_targetDate_idx"
  ON "SavingsGoal"("profileId", "status", "targetDate");

DO $$ BEGIN
  ALTER TABLE "SavingsGoal" ADD CONSTRAINT "SavingsGoal_profileId_fkey"
    FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- PersonalExpense intentionally keeps legacy TEXT currency/categoryKey columns.
-- API validation constrains currency to UYU|USD and categoryKey to FinanceCategory;
-- preserving TEXT avoids breaking existing consumers and retains unmapped legacy values.
CREATE INDEX IF NOT EXISTS "ScheduledCashFlow_profileId_scheduledDueOn_idx"
  ON "ScheduledCashFlow"("profileId", "scheduledDueOn");
CREATE INDEX IF NOT EXISTS "ScheduledCashFlow_profileId_lifecycle_idx"
  ON "ScheduledCashFlow"("profileId", "lifecycle");
CREATE INDEX IF NOT EXISTS "PersonalExpense_profileId_monthKey_idx"
  ON "PersonalExpense"("profileId", "monthKey");
CREATE INDEX IF NOT EXISTS "PersonalExpense_financeAccountId_profileId_idx"
  ON "PersonalExpense"("financeAccountId", "profileId");
CREATE INDEX IF NOT EXISTS "PersonalExpenseItem_expenseId_idx"
  ON "PersonalExpenseItem"("expenseId");
