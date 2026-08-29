CREATE TYPE "FinanceCurrency" AS ENUM ('UYU', 'USD');
CREATE TYPE "CashFlowDirection" AS ENUM ('INFLOW', 'OUTFLOW');
CREATE TYPE "CashFlowLifecycle" AS ENUM ('PENDING', 'PAID', 'RECEIVED', 'SKIPPED');

CREATE TABLE "FinanceAccount" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "currency" "FinanceCurrency" NOT NULL,
  "balance" DECIMAL(12,2) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FinanceAccount_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "FinanceAccount_profileId_currency_key" ON "FinanceAccount"("profileId", "currency");
CREATE INDEX "FinanceAccount_profileId_idx" ON "FinanceAccount"("profileId");
ALTER TABLE "FinanceAccount" ADD CONSTRAINT "FinanceAccount_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ScheduledCashFlow" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "amount" DECIMAL(10,2) NOT NULL,
  "currency" TEXT NOT NULL,
  "direction" "CashFlowDirection" NOT NULL,
  "scheduledDueOn" DATE NOT NULL,
  "lifecycle" "CashFlowLifecycle" NOT NULL DEFAULT 'PENDING',
  "personalExpenseId" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ScheduledCashFlow_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ScheduledCashFlow_personalExpenseId_key" ON "ScheduledCashFlow"("personalExpenseId");
CREATE INDEX "ScheduledCashFlow_profileId_scheduledDueOn_idx" ON "ScheduledCashFlow"("profileId", "scheduledDueOn");
CREATE INDEX "ScheduledCashFlow_profileId_lifecycle_idx" ON "ScheduledCashFlow"("profileId", "lifecycle");
ALTER TABLE "ScheduledCashFlow" ADD CONSTRAINT "ScheduledCashFlow_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScheduledCashFlow" ADD CONSTRAINT "ScheduledCashFlow_personalExpenseId_fkey" FOREIGN KEY ("personalExpenseId") REFERENCES "PersonalExpense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PersonalExpense" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'UYU';
ALTER TABLE "PersonalExpense" ADD COLUMN "scheduledCashFlowId" TEXT;
ALTER TABLE "PersonalExpense" ADD COLUMN "scheduledDueOn" DATE;
ALTER TABLE "PersonalExpense" ADD COLUMN "source" TEXT;
ALTER TABLE "PersonalExpense" ADD COLUMN "sourceMessageId" TEXT;
ALTER TABLE "PersonalExpense" ADD COLUMN "financeAccountId" TEXT;
CREATE UNIQUE INDEX "PersonalExpense_sourceMessageId_key" ON "PersonalExpense"("sourceMessageId");
CREATE UNIQUE INDEX "PersonalExpense_scheduledCashFlowId_scheduledDueOn_key" ON "PersonalExpense"("scheduledCashFlowId", "scheduledDueOn");
ALTER TABLE "PersonalExpense" ADD CONSTRAINT "PersonalExpense_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
