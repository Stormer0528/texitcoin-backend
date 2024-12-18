/*
  Warnings:

  - A unique constraint covering the columns `[weekStartDate]` on the table `weeklyreports` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "unique_week_index_on_weeklyreport" ON "weeklyreports"("weekStartDate");

-- AddForeignKey
ALTER TABLE "weeklyreports" ADD CONSTRAINT "weeklyreports_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- RenameIndex
ALTER INDEX "unique_index_on_weeklyreport" RENAME TO "unique_file_index_on_weeklyreport";
