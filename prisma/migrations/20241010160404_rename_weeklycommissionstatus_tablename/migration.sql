/*
  Warnings:

  - You are about to drop the `WeeklyCommissionStatus` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WeeklyCommissionStatus" DROP CONSTRAINT "WeeklyCommissionStatus_memberId_fkey";

-- DropForeignKey
ALTER TABLE "WeeklyCommissionStatus" DROP CONSTRAINT "WeeklyCommissionStatus_weeklyCommissionId_fkey";

-- DropTable
DROP TABLE "WeeklyCommissionStatus";

-- CreateTable
CREATE TABLE "weeklycommissionstatuses" (
    "id" TEXT NOT NULL,
    "weeklyCommissionId" TEXT,
    "leftPoint" INTEGER NOT NULL DEFAULT 0,
    "rightPoint" INTEGER NOT NULL DEFAULT 0,
    "memberId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "weeklycommissionstatuses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "weeklycommissionstatuses_weeklyCommissionId_key" ON "weeklycommissionstatuses"("weeklyCommissionId");

-- AddForeignKey
ALTER TABLE "weeklycommissionstatuses" ADD CONSTRAINT "weeklycommissionstatuses_weeklyCommissionId_fkey" FOREIGN KEY ("weeklyCommissionId") REFERENCES "weeklycommissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "weeklycommissionstatuses" ADD CONSTRAINT "weeklycommissionstatuses_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
