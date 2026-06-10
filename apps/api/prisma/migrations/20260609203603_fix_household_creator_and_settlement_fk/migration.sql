/*
  Warnings:

  - Added the required column `createdById` to the `Household` table without a default value. This is not possible if the table is not empty.
  - Made the column `householdId` on table `Settlement` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Household" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Settlement" ALTER COLUMN "householdId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Household" ADD CONSTRAINT "Household_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Settlement" ADD CONSTRAINT "Settlement_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE CASCADE ON UPDATE CASCADE;
