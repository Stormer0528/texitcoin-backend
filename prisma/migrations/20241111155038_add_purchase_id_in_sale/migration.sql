/*
  Warnings:

  - A unique constraint covering the columns `[purchaseId]` on the table `sales` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "purchaseId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "sales_purchaseId_key" ON "sales"("purchaseId");

WITH RankedData AS (
    SELECT 
        id,
        RANK() OVER (ORDER BY "orderedAt" ASC, "id" ASC) AS rank
    FROM 
        sales
)
UPDATE sales
SET "purchaseId" = RankedData.rank
FROM RankedData
WHERE sales.id = RankedData.id;
