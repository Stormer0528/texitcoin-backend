/*
  Warnings:

  - You are about to drop the column `createdAt` on the `referencelinks` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `referencelinks` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `referencelinks` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "ProofType" ADD VALUE 'PREPAY';
ALTER TYPE "ProofType" ADD VALUE 'SALE';

-- AlterTable
ALTER TABLE "prepaidcommissions" ADD COLUMN     "ID" SERIAL NOT NULL;
CREATE UNIQUE INDEX "index_prepaidcommissions_on_ID" ON "prepaidcommissions"("ID");

UPDATE prepaidcommissions SET "ID" = -"ID";

WITH withPrepaidIDs AS (
    SELECT 
        "id", 
        ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) AS row_num
    FROM "prepaidcommissions"
)
UPDATE "prepaidcommissions"
SET "ID" = withPrepaidIDs.row_num
FROM withPrepaidIDs
WHERE "prepaidcommissions"."id" = withPrepaidIDs."id";
