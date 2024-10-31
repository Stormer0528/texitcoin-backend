/*
  Warnings:

  - A unique constraint covering the columns `[fileId]` on the table `filesales` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "unique_index_on_filesale";

-- CreateIndex
CREATE UNIQUE INDEX "unique_index_on_filesale" ON "filesales"("fileId");
