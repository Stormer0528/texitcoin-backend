/*
  Warnings:

  - A unique constraint covering the columns `[refCode]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "members" ADD COLUMN     "refCode" TEXT NOT NULL DEFAULT "substring"(md5(((random())::text || (nextval('unique_seq'::regclass))::text)), 1, 12);

-- CreateIndex
CREATE UNIQUE INDEX "members_refCode_key" ON "members"("refCode");
