-- AlterTable
ALTER TABLE "proofs" ADD COLUMN     "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE proofs
SET "orderedAt" = sales."orderedAt"
FROM sales
WHERE proofs."refId" = CONCAT('S-', LPAD(sales."ID"::TEXT, 7, '0')) and proofs.type = 'SALE';

UPDATE proofs
SET "orderedAt" = c."createdAt"
FROM weeklycommissions c
WHERE proofs."refId" = CONCAT('C-', LPAD(c."ID"::TEXT, 7, '0')) and proofs.type = 'COMMISSION';
