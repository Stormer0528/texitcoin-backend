/*
  Warnings:

  - A unique constraint covering the columns `[address,deletedAt]` on the table `memberwallets` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "unique_index_address_on_memberwallets" ON "memberwallets"("address", "deletedAt");
