/*
  Warnings:

  - A unique constraint covering the columns `[issuedAt]` on the table `dailyblocks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[issuedAt]` on the table `monthlyblocks` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[issuedAt]` on the table `weeklyblocks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "index_issuedAt_on_dailyblocks" ON "dailyblocks"("issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "index_issuedAt_on_monthlyblocks" ON "monthlyblocks"("issuedAt");

-- CreateIndex
CREATE UNIQUE INDEX "index_issuedAt_on_weeklyblocks" ON "weeklyblocks"("issuedAt");
