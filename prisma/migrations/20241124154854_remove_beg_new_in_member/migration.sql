/*
  Warnings:

  - You are about to drop the column `begL` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `begR` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `newL` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `newR` on the `members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "members" DROP COLUMN "begL",
DROP COLUMN "begR",
DROP COLUMN "newL",
DROP COLUMN "newR";
