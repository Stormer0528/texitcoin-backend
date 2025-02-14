-- CreateTable
CREATE TABLE "filecommissions" (
    "id" TEXT NOT NULL,
    "commissionId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "filecommissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "unique_index_on_filecommission" ON "filecommissions"("fileId");

-- AddForeignKey
ALTER TABLE "filecommissions" ADD CONSTRAINT "filecommissions_commissionId_fkey" FOREIGN KEY ("commissionId") REFERENCES "weeklycommissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "filecommissions" ADD CONSTRAINT "filecommissions_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
