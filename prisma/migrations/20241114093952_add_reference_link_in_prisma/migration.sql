-- CreateTable
CREATE TABLE "referencelinks" (
    "id" TEXT NOT NULL,
    "saleId" TEXT,
    "commissionId" TEXT,
    "link" TEXT NOT NULL,
    "prepaidCommissionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "referencelinks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "referencelinks" ADD CONSTRAINT "referencelinks_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "referencelinks" ADD CONSTRAINT "referencelinks_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "weeklycommissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "referencelinks" ADD CONSTRAINT "referencelinks_prepaidCommissionId_fkey" FOREIGN KEY ("prepaidCommissionId") REFERENCES "prepaidcommissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
