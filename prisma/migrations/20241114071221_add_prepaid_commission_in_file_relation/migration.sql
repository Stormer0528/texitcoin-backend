-- AlterTable
ALTER TABLE "filerelations" ADD COLUMN     "prepaidCommissionId" TEXT;

-- AddForeignKey
ALTER TABLE "filerelations" ADD CONSTRAINT "filerelations_prepaidCommissionId_fkey" FOREIGN KEY ("prepaidCommissionId") REFERENCES "prepaidcommissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
