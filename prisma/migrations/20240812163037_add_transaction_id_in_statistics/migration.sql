/*
  Warnings:

  - A unique constraint covering the columns `[transactionId]` on the table `statistics` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "statistics" ADD COLUMN     "transactionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "index_statistics_on_transactionId" ON "statistics"("transactionId");
