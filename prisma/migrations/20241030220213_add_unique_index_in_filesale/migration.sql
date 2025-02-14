/*
  Warnings:

  - A unique constraint covering the columns `[saleId,fileId]` on the table `filesales` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "unique_index_on_filesale" ON "filesales"("saleId", "fileId");
