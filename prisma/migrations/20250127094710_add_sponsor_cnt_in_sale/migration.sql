/*
  Warnings:

  - You are about to drop the column `freeShareSale` on the `sales` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "sales" DROP COLUMN "freeShareSale",
ADD COLUMN     "sponsorCnt" INTEGER NOT NULL DEFAULT 0;
