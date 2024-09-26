/*
  Warnings:

  - You are about to drop the column `freePeriodFrom` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `freePeriodTo` on the `packages` table. All the data in the column will be lost.
  - You are about to drop the column `isFreeShare` on the `packages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "packages" DROP COLUMN "freePeriodFrom",
DROP COLUMN "freePeriodTo",
DROP COLUMN "isFreeShare";
