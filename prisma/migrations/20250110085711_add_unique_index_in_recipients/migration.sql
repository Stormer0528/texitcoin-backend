/*
  Warnings:

  - A unique constraint covering the columns `[emailId,recipientId]` on the table `recipients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "unique_index_on_recipients" ON "recipients"("emailId", "recipientId");
