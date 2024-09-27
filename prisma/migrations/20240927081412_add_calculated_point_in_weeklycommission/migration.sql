-- AlterTable
ALTER TABLE "weeklycommissions" ADD COLUMN     "calculatedLeftPoint" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "calculatedRightPoint" INTEGER NOT NULL DEFAULT 0;
