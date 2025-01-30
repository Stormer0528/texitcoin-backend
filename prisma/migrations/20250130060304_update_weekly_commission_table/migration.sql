/*
  Warnings:

  - You are about to drop the column `other` on the `weeklycommissions` table. All the data in the column will be lost.
  - You are about to drop the column `splitWay` on the `weeklycommissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "weeklycommissions" DROP COLUMN "other",
DROP COLUMN "splitWay";
