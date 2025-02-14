/*
  Warnings:

  - You are about to drop the column `bogo` on the `weeklycommissions` table. All the data in the column will be lost.
  - You are about to drop the column `cash` on the `weeklycommissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "weeklycommissions" DROP COLUMN "bogo",
DROP COLUMN "cash";
