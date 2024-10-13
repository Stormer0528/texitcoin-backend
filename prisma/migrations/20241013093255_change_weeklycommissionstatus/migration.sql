/*
  Warnings:

  - You are about to drop the column `leftPoint` on the `weeklycommissionstatuses` table. All the data in the column will be lost.
  - You are about to drop the column `rightPoint` on the `weeklycommissionstatuses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "weeklycommissionstatuses" DROP COLUMN "leftPoint",
DROP COLUMN "rightPoint",
ADD COLUMN     "afterLeftPoint" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "afterRightPoint" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "beforeLeftPoint" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "beforeRightPoint" INTEGER NOT NULL DEFAULT 0;
