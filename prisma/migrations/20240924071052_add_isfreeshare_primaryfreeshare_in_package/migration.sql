/*
  Warnings:

  - You are about to drop the column `freeShare` on the `packages` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "packages" DROP COLUMN "freeShare",
ADD COLUMN     "isFreeShare" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "primaryFreeShare" BOOLEAN NOT NULL DEFAULT false;
