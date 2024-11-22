/*
  Warnings:

  - You are about to drop the column `commission` on the `prepaidcommissions` table. All the data in the column will be lost.
  - You are about to drop the column `memberId` on the `prepaidcommissions` table. All the data in the column will be lost.
  - You are about to drop the column `pkgL` on the `prepaidcommissions` table. All the data in the column will be lost.
  - You are about to drop the column `pkgR` on the `prepaidcommissions` table. All the data in the column will be lost.
  - You are about to drop the column `weekStartDate` on the `prepaidcommissions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[commissionId]` on the table `prepaidcommissions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "prepaidcommissions" DROP CONSTRAINT "prepaidcommissions_memberId_fkey";

-- AlterTable
ALTER TABLE "prepaidcommissions" DROP COLUMN "commission",
DROP COLUMN "memberId",
DROP COLUMN "pkgL",
DROP COLUMN "pkgR",
DROP COLUMN "weekStartDate",
ADD COLUMN     "commissionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "prepaidcommissions_commissionId_key" ON "prepaidcommissions"("commissionId");

-- AddForeignKey
ALTER TABLE "prepaidcommissions" ADD CONSTRAINT "prepaidcommissions_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "weeklycommissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
