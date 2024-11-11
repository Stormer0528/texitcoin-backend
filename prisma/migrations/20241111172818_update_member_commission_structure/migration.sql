/*
  Warnings:

  - You are about to drop the column `currentL` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `currentR` on the `members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "currentL",
DROP COLUMN "currentR",
ADD COLUMN     "begL" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "begR" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "newL" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "newR" INTEGER NOT NULL DEFAULT 0;
