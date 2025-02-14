/*
  Warnings:

  - You are about to drop the column `userId` on the `members` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseId` on the `sales` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ID]` on the table `members` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ID]` on the table `sales` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ID]` on the table `weeklycommissions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "index_members_on_userId";

-- DropIndex
DROP INDEX "sales_purchaseId_key";

-- AlterTable
ALTER TABLE "members" DROP COLUMN "userId",
ADD COLUMN     "ID" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "purchaseId",
ADD COLUMN     "ID" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "weeklycommissions" ADD COLUMN     "ID" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "index_members_on_ID" ON "members"("ID");

-- CreateIndex
CREATE UNIQUE INDEX "index_sales_on_ID" ON "sales"("ID");

-- CreateIndex
CREATE UNIQUE INDEX "index_weeklycommissions_on_ID" ON "weeklycommissions"("ID");
