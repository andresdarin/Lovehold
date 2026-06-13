-- CreateTable
CREATE TABLE "PersonalExpense" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "merchant" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "notes" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceDay" INTEGER,
    "monthKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalExpenseItem" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(10,3),
    "unitPrice" DECIMAL(10,2),
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "category" TEXT NOT NULL,
    "rawLine" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalExpenseItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PersonalExpense_profileId_monthKey_idx" ON "PersonalExpense"("profileId", "monthKey");

-- CreateIndex
CREATE INDEX "PersonalExpenseItem_expenseId_idx" ON "PersonalExpenseItem"("expenseId");

-- AddForeignKey
ALTER TABLE "PersonalExpenseItem" ADD CONSTRAINT "PersonalExpenseItem_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "PersonalExpense"("id") ON DELETE CASCADE ON UPDATE CASCADE;
