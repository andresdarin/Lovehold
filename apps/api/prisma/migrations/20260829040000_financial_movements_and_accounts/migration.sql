-- CreateEnum
CREATE TYPE "FinanceAccountType" AS ENUM ('CASH', 'BANK', 'CREDIT');

-- CreateEnum
CREATE TYPE "FinancialMovementType" AS ENUM ('EXPENSE', 'INCOME', 'TRANSFER');

-- CreateEnum
CREATE TYPE "FinancialInputMethod" AS ENUM ('MANUAL', 'RECEIPT_SCAN', 'IMPORT');

-- AlterTable
ALTER TABLE "FinanceAccount" ADD COLUMN IF NOT EXISTS "type" "FinanceAccountType" NOT NULL DEFAULT 'BANK';
ALTER TABLE "FinanceAccount" ADD COLUMN IF NOT EXISTS "creditLimit" DECIMAL(18,2);
ALTER TABLE "FinanceAccount" ADD COLUMN IF NOT EXISTS "closingDay" INTEGER;
ALTER TABLE "FinanceAccount" ADD COLUMN IF NOT EXISTS "dueDay" INTEGER;

-- AlterTable
ALTER TABLE "PersonalExpense" ADD COLUMN IF NOT EXISTS "movementType" "FinancialMovementType" NOT NULL DEFAULT 'EXPENSE';
ALTER TABLE "PersonalExpense" ADD COLUMN IF NOT EXISTS "inputMethod" "FinancialInputMethod" NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "PersonalExpense" ADD COLUMN IF NOT EXISTS "destinationAccountId" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PersonalExpense_destinationAccountId_profileId_idx" ON "PersonalExpense"("destinationAccountId", "profileId");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PersonalExpense_destinationAccountId_fkey'
  ) THEN
    ALTER TABLE "PersonalExpense" ADD CONSTRAINT "PersonalExpense_destinationAccountId_fkey" FOREIGN KEY ("destinationAccountId") REFERENCES "FinanceAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
