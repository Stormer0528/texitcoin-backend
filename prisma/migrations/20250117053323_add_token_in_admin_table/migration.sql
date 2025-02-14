/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `admins` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "token" VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX "index_admins_on_token" ON "admins"("token");
