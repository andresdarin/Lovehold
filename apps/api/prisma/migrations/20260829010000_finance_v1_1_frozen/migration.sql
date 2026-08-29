-- V1.1 frozen safety migration. Run only after DEV/TEST preflight; never production.
CREATE TYPE "CashFlowFrequency" AS ENUM ('ONCE', 'MONTHLY');
CREATE TYPE "CashFlowCertainty" AS ENUM ('CONFIRMED', 'ESTIMATED');
CREATE TYPE "CashFlowStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED');
CREATE TYPE "CashFlowResolution" AS ENUM ('PAID', 'RECEIVED', 'SKIPPED');
CREATE TYPE "FinanceCategory" AS ENUM ('HOUSING', 'UTILITIES', 'FOOD', 'TRANSPORT', 'HEALTH', 'LEISURE', 'PETS', 'SHOPPING', 'EDUCATION', 'DEBT', 'TAXES', 'OTHER');
ALTER TYPE "CashFlowLifecycle" ADD VALUE IF NOT EXISTS 'OVERDUE';

ALTER TABLE "FinanceAccount"
  ADD COLUMN "name" TEXT,
  ADD COLUMN "isSpendable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "balanceAsOf" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
UPDATE "FinanceAccount" SET "name" = 'Legacy ' || "currency" || ' ' || "id" WHERE "name" IS NULL;
ALTER TABLE "FinanceAccount" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "FinanceAccount" ALTER COLUMN "balance" TYPE DECIMAL(18,2);
DROP INDEX IF EXISTS "FinanceAccount_profileId_currency_key";
DROP INDEX IF EXISTS "FinanceAccount_profileId_idx";
CREATE UNIQUE INDEX "FinanceAccount_profileId_name_key" ON "FinanceAccount"("profileId", "name");
CREATE INDEX "FinanceAccount_profileId_isActive_isSpendable_idx" ON "FinanceAccount"("profileId", "isActive", "isSpendable");

ALTER TABLE "ScheduledCashFlow"
  ADD COLUMN "accountId" TEXT,
  ADD COLUMN "title" TEXT,
  ADD COLUMN "frequency" "CashFlowFrequency" NOT NULL DEFAULT 'ONCE',
  ADD COLUMN "nextDueOn" DATE,
  ADD COLUMN "dayOfMonth" INTEGER,
  ADD COLUMN "endsOn" DATE,
  ADD COLUMN "certainty" "CashFlowCertainty" NOT NULL DEFAULT 'ESTIMATED',
  ADD COLUMN "categoryKey" "FinanceCategory",
  ADD COLUMN "status" "CashFlowStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "lastResolvedDueOn" DATE,
  ADD COLUMN "lastResolutionStatus" "CashFlowResolution",
  ADD COLUMN "lastResolvedAt" TIMESTAMP(3);
UPDATE "ScheduledCashFlow" SET "title" = COALESCE("description", 'Scheduled cash flow'), "nextDueOn" = "scheduledDueOn" WHERE "title" IS NULL;
ALTER TABLE "ScheduledCashFlow" ALTER COLUMN "title" SET NOT NULL;
ALTER TABLE "ScheduledCashFlow" ALTER COLUMN "amount" TYPE DECIMAL(18,2);
ALTER TABLE "ScheduledCashFlow" ALTER COLUMN "currency" TYPE "FinanceCurrency" USING "currency"::"FinanceCurrency";
ALTER TABLE "ScheduledCashFlow" DROP CONSTRAINT IF EXISTS "ScheduledCashFlow_personalExpenseId_fkey";
DROP INDEX IF EXISTS "ScheduledCashFlow_personalExpenseId_key";
ALTER TABLE "ScheduledCashFlow" DROP COLUMN IF EXISTS "personalExpenseId";
ALTER TABLE "ScheduledCashFlow" ADD CONSTRAINT "ScheduledCashFlow_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "FinanceAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "PersonalExpense" SET "currency" = 'UYU' WHERE "currency" IS NULL OR btrim("currency") = '';
ALTER TABLE "PersonalExpense" ALTER COLUMN "amount" TYPE DECIMAL(18,2);
ALTER TABLE "PersonalExpense" ADD COLUMN "categoryKey" TEXT;
UPDATE "PersonalExpense" SET "categoryKey" = 'OTHER'
  WHERE "categoryKey" IS NULL AND upper("category") IN ('OTROS', 'OTROS_SUPER', 'OTHER');
DO $$ BEGIN
  ALTER TABLE "PersonalExpense" ADD CONSTRAINT "PersonalExpense_financeAccountId_fkey"
    FOREIGN KEY ("financeAccountId") REFERENCES "FinanceAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
CREATE INDEX IF NOT EXISTS "PersonalExpense_financeAccountId_profileId_idx"
  ON "PersonalExpense"("financeAccountId", "profileId");
ALTER TABLE "PersonalExpense" ADD CONSTRAINT "PersonalExpense_scheduledCashFlowId_fkey"
  FOREIGN KEY ("scheduledCashFlowId") REFERENCES "ScheduledCashFlow"("id") ON DELETE SET NULL ON UPDATE CASCADE;
