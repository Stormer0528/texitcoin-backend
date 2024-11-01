/*
  Warnings:

  - You are about to drop the column `refCode` on the `members` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "members_refCode_key";

-- AlterTable
ALTER TABLE "members" DROP COLUMN "refCode";
