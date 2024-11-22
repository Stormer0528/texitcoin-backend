/*
  Warnings:

  - A unique constraint covering the columns `[memberId,weekStartDate]` on the table `weeklycommissions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "unique_index_on_weeklycommissions" ON "weeklycommissions"("memberId", "weekStartDate");
