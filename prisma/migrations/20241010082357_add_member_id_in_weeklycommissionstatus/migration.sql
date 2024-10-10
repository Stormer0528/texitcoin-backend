/*
  Warnings:

  - Added the required column `memberId` to the `WeeklyCommissionStatus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WeeklyCommissionStatus" ADD COLUMN     "memberId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "WeeklyCommissionStatus" ADD CONSTRAINT "WeeklyCommissionStatus_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
