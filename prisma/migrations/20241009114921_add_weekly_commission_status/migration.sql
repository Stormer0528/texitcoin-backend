-- CreateTable
CREATE TABLE "WeeklyCommissionStatus" (
    "id" TEXT NOT NULL,
    "weeklyCommissionId" TEXT,
    "leftPoint" INTEGER NOT NULL DEFAULT 0,
    "rightPoint" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WeeklyCommissionStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyCommissionStatus_weeklyCommissionId_key" ON "WeeklyCommissionStatus"("weeklyCommissionId");

-- AddForeignKey
ALTER TABLE "WeeklyCommissionStatus" ADD CONSTRAINT "WeeklyCommissionStatus_weeklyCommissionId_fkey" FOREIGN KEY ("weeklyCommissionId") REFERENCES "weeklycommissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
