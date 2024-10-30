-- CreateTable
CREATE TABLE "filesales" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "filesales_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "filesales" ADD CONSTRAINT "filesales_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "filesales" ADD CONSTRAINT "filesales_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
