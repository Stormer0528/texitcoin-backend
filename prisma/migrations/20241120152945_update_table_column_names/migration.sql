/*
  Warnings:

  - You are about to drop the column `addInfoId` on the `filerelations` table. All the data in the column will be lost.
  - You are about to drop the column `addInfoId` on the `referencelinks` table. All the data in the column will be lost.
  - You are about to drop the `additionalinformations` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `proofId` to the `filerelations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `proofId` to the `referencelinks` table without a default value. This is not possible if the table is not empty.

*/
  
-- Rename columns
ALTER TABLE "filerelations" RENAME COLUMN "addInfoId" TO "proofId";
ALTER TABLE "referencelinks" RENAME COLUMN "addInfoId" TO "proofId";

-- Rename table
ALTER TABLE "additionalinformations" RENAME TO "proofs";

-- AlterTable
ALTER TABLE "proofs" RENAME CONSTRAINT "additionalinformations_pkey" TO "proofs_pkey";

-- RenameForeignKey
ALTER TABLE "filerelations" RENAME CONSTRAINT "filerelations_addInfoId_fkey" TO "filerelations_proofId_fkey";

-- RenameForeignKey
ALTER TABLE "referencelinks" RENAME CONSTRAINT "referencelinks_addInfoId_fkey" TO "referencelinks_proofId_fkey";

-- RenameUniqueIndex
ALTER INDEX "unique_index_on_additionalinformation" RENAME TO "unique_index_on_proof";
