/*
  Warnings:

  - Added the required column `linkType` to the `referencelinks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "referencelinks" ADD COLUMN     "linkType" TEXT NOT NULL;
