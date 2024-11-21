/*
  Warnings:

  - You are about to drop the column `commissionId` on the `filerelations` table. All the data in the column will be lost.
  - You are about to drop the column `prepaidCommissionId` on the `filerelations` table. All the data in the column will be lost.
  - You are about to drop the column `proofId` on the `filerelations` table. All the data in the column will be lost.
  - You are about to drop the column `saleId` on the `filerelations` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `prepaidcommissions` table. All the data in the column will be lost.
  - You are about to drop the column `commissionId` on the `referencelinks` table. All the data in the column will be lost.
  - You are about to drop the column `prepaidCommissionId` on the `referencelinks` table. All the data in the column will be lost.
  - You are about to drop the column `saleId` on the `referencelinks` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `sales` table. All the data in the column will be lost.
  - You are about to drop the column `note` on the `weeklycommissions` table. All the data in the column will be lost.
  - You are about to drop the `proofs` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `addInfoId` to the `filerelations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addInfoId` to the `referencelinks` table without a default value. This is not possible if the table is not empty.

*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- DropForeignKeys
ALTER TABLE "filerelations" DROP CONSTRAINT "filerelations_commissionId_fkey";
ALTER TABLE "filerelations" DROP CONSTRAINT "filerelations_prepaidCommissionId_fkey";
ALTER TABLE "filerelations" DROP CONSTRAINT "filerelations_proofId_fkey";
ALTER TABLE "filerelations" DROP CONSTRAINT "filerelations_saleId_fkey";
ALTER TABLE "referencelinks" DROP CONSTRAINT "referencelinks_commissionId_fkey";
ALTER TABLE "referencelinks" DROP CONSTRAINT "referencelinks_prepaidCommissionId_fkey";
ALTER TABLE "referencelinks" DROP CONSTRAINT "referencelinks_saleId_fkey";

-- CreateTable(AdditionalInformations)
CREATE TABLE "additionalinformations" (
    "id" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "type" "ProofType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "note" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "additionalinformations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "unique_index_on_additionalinformation" ON "additionalinformations"("refId", "type");

-- Insert data from sale, commission, prepay
-- sale
INSERT INTO additionalinformations (id, "refId", "note", "amount", type, "createdAt", "updatedAt")
SELECT gen_random_uuid(), CONCAT('S-', LPAD(sales."ID"::TEXT, 7, '0')), "note", packages.amount, 'SALE', NOW(), NOW()
FROM sales
JOIN packages ON sales."packageId" = packages."id"
ON CONFLICT ("refId", type) DO NOTHING;

-- commission note
INSERT INTO additionalinformations (id, "refId", "note", "amount", type, "createdAt", "updatedAt")
SELECT gen_random_uuid(), CONCAT('C-', LPAD("ID"::TEXT, 7, '0')), "note", "commission", 'COMMISSION', NOW(), NOW()
FROM weeklycommissions
WHERE "commission" > 0 AND status <> 'PREVIEW'
ON CONFLICT ("refId", type) DO NOTHING;

-- prepay note
INSERT INTO additionalinformations (id, "refId", "note", "amount", type, "createdAt", "updatedAt")
SELECT gen_random_uuid(), CONCAT('PC-', LPAD("ID"::TEXT, 7, '0')), "note", "commission", 'PREPAY', NOW(), NOW()
FROM prepaidcommissions
ON CONFLICT ("refId", type) DO NOTHING;

-- set addInfoId in filerelations

ALTER TABLE "filerelations" ADD COLUMN     "addInfoId" TEXT NOT NULL DEFAULT('');

-- Update with commissionId references
UPDATE filerelations f
SET "addInfoId" = a.id
FROM additionalinformations a
JOIN weeklycommissions c ON CONCAT('C-', LPAD(c."ID"::TEXT, 7, '0'))= a."refId"
WHERE f."commissionId" = c.id and a.type='COMMISSION';

-- Update with prepaidCommissionId references
UPDATE filerelations f
SET "addInfoId" = a.id
FROM additionalinformations a
JOIN prepaidcommissions pc ON CONCAT('PC-', LPAD(pc."ID"::TEXT, 7, '0')) = a."refId"
WHERE f."prepaidCommissionId" = pc.id and a.type = 'PREPAY';

-- Update with saleId references
UPDATE filerelations f
SET "addInfoId" = a.id
FROM additionalinformations a
JOIN sales s ON CONCAT('S-', LPAD(s."ID"::TEXT, 7, '0')) = a."refId"
WHERE f."saleId" = s.id and a.type = 'SALE';

ALTER TABLE "filerelations" DROP COLUMN "commissionId",
DROP COLUMN "prepaidCommissionId",
DROP COLUMN "proofId",
DROP COLUMN "saleId",
ALTER COLUMN "addInfoId" DROP DEFAULT;

-- set addInfoId in referencelinks

ALTER TABLE "referencelinks" ADD COLUMN     "addInfoId" TEXT NOT NULL DEFAULT('');

-- Update with commissionId references
UPDATE referencelinks rl
SET "addInfoId" = a.id
FROM additionalinformations a
JOIN weeklycommissions c ON CONCAT('C-', LPAD(c."ID"::TEXT, 7, '0')) = a."refId"
WHERE rl."commissionId" = c.id and a.type='COMMISSION';

-- Update with prepaidCommissionId references
UPDATE referencelinks rl
SET "addInfoId" = a.id
FROM additionalinformations a
JOIN prepaidcommissions pc ON CONCAT('PC-', LPAD(pc."ID"::TEXT, 7, '0')) = a."refId"
WHERE rl."prepaidCommissionId" = pc.id and a.type = 'PREPAY';

-- Update with saleId references
UPDATE referencelinks rl
SET "addInfoId" = a.id
FROM additionalinformations a
JOIN sales s ON CONCAT('S-', LPAD(s."ID"::TEXT, 7, '0')) = a."refId"
WHERE rl."saleId" = s.id and a.type = 'SALE';


ALTER TABLE "referencelinks" DROP COLUMN "commissionId",
DROP COLUMN "prepaidCommissionId",
DROP COLUMN "saleId",
ALTER COLUMN "addInfoId" DROP DEFAULT;;


-- AlterTable
ALTER TABLE "prepaidcommissions" DROP COLUMN "note";
ALTER TABLE "sales" DROP COLUMN "note";
ALTER TABLE "weeklycommissions" DROP COLUMN "note";
DROP TABLE "proofs";
ALTER TABLE "filerelations" ADD CONSTRAINT "filerelations_addInfoId_fkey" FOREIGN KEY ("addInfoId") REFERENCES "additionalinformations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "referencelinks" ADD CONSTRAINT "referencelinks_addInfoId_fkey" FOREIGN KEY ("addInfoId") REFERENCES "additionalinformations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
