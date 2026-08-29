-- Idempotency keys are scoped to a profile, not globally across tenants.
DROP INDEX IF EXISTS "PersonalExpense_sourceMessageId_key";
ALTER TABLE "PersonalExpense" ADD CONSTRAINT "PersonalExpense_profileId_sourceMessageId_key" UNIQUE ("profileId", "sourceMessageId");
ALTER TABLE "ScheduledCashFlow" ADD COLUMN IF NOT EXISTS "sourceMessageId" TEXT;
ALTER TABLE "ScheduledCashFlow" ADD CONSTRAINT "ScheduledCashFlow_profileId_sourceMessageId_key" UNIQUE ("profileId", "sourceMessageId");
