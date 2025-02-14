/*
  Warnings:

  - You are about to drop the column `saleId` on the `prepaidcommissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "prepaidcommissions" DROP COLUMN "saleId",
ADD COLUMN     "txId" TEXT;

-- AddForeignKey
ALTER TABLE "prepaidcommissions" ADD CONSTRAINT "prepaidcommissions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
