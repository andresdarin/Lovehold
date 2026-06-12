-- CreateEnum
CREATE TYPE "ExpenseItemCategory" AS ENUM ('ALIMENTOS', 'VERDURAS', 'FRUTAS', 'LACTEOS', 'CARNES_FIAMBRES', 'PANIFICADOS', 'BEBIDAS', 'ALCOHOL', 'SNACKS_DULCES', 'HIGIENE', 'LIMPIEZA_HOGAR', 'MASCOTAS', 'OTROS');

-- AlterTable
ALTER TABLE "Expense" ADD COLUMN     "merchant" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "receiptDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ExpenseItem" (
    "id" TEXT NOT NULL,
    "expenseId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "itemCategory" "ExpenseItemCategory" NOT NULL,
    "quantity" DECIMAL(10,3),
    "unit" TEXT,
    "unitPrice" DECIMAL(10,2),
    "total" DECIMAL(10,2) NOT NULL,
    "rawText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExpenseItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExpenseItem" ADD CONSTRAINT "ExpenseItem_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE CASCADE ON UPDATE CASCADE;
