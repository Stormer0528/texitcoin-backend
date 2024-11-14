/*
  Warnings:

  - You are about to drop the `filecommissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `filesales` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "filecommissions" DROP CONSTRAINT "filecommissions_commissionId_fkey";

-- DropForeignKey
ALTER TABLE "filecommissions" DROP CONSTRAINT "filecommissions_fileId_fkey";

-- DropForeignKey
ALTER TABLE "filesales" DROP CONSTRAINT "filesales_fileId_fkey";

-- DropForeignKey
ALTER TABLE "filesales" DROP CONSTRAINT "filesales_saleId_fkey";

-- CreateTable
CREATE TABLE "filerelations" (
    "id" TEXT NOT NULL,
    "saleId" TEXT,
    "commissionId" TEXT,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "filerelations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_index_on_filerelation" ON "filerelations"("fileId");

-- AddForeignKey
ALTER TABLE "filerelations" ADD CONSTRAINT "filerelations_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "filerelations" ADD CONSTRAINT "filerelations_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "weeklycommissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "filerelations" ADD CONSTRAINT "filerelations_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

INSERT INTO filerelations (id, "saleId", "commissionId", "fileId", "createdAt", "updatedAt", "deletedAt")
SELECT id, "saleId", NULL AS "commissionId", "fileId", "createdAt", "updatedAt", "deletedAt"
FROM filesales;

INSERT INTO filerelations (id, "saleId", "commissionId", "fileId", "createdAt", "updatedAt", "deletedAt")
SELECT id, NULL AS "saleId", "commissionId", "fileId", "createdAt", "updatedAt", "deletedAt"
FROM filecommissions;

-- DropTable
DROP TABLE "filecommissions";

-- DropTable
DROP TABLE "filesales";