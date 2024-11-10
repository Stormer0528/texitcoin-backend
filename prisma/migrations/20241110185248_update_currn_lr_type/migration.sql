/*
  Warnings:

  - Made the column `currentL` on table `members` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currentR` on table `members` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "members" ALTER COLUMN "currentL" SET NOT NULL,
ALTER COLUMN "currentR" SET NOT NULL;
