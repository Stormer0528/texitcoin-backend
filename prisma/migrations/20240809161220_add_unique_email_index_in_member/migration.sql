/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "index_members_on_email" ON "members"("email");
