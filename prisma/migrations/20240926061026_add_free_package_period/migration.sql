/*
  Warnings:

  - You are about to drop the column `primaryFreeShare` on the `packages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "packages" DROP COLUMN "primaryFreeShare",
ADD COLUMN     "freePeriodFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "freePeriodTo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
