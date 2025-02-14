/*
  Warnings:

  - You are about to drop the column `afterLeftPoint` on the `weeklycommissions` table. All the data in the column will be lost.
  - You are about to drop the column `afterRightPoint` on the `weeklycommissions` table. All the data in the column will be lost.
  - You are about to drop the column `beforeLeftPoint` on the `weeklycommissions` table. All the data in the column will be lost.
  - You are about to drop the column `beforeRightPoint` on the `weeklycommissions` table. All the data in the column will be lost.
  - You are about to drop the column `calculatedLeftPoint` on the `weeklycommissions` table. All the data in the column will be lost.
  - You are about to drop the column `calculatedRightPoint` on the `weeklycommissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "weeklycommissions" DROP COLUMN "afterLeftPoint",
DROP COLUMN "afterRightPoint",
DROP COLUMN "beforeLeftPoint",
DROP COLUMN "beforeRightPoint",
DROP COLUMN "calculatedLeftPoint",
DROP COLUMN "calculatedRightPoint",
ADD COLUMN     "begL" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "begR" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "endL" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "endR" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxL" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxR" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "newL" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "newR" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pkgL" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pkgR" INTEGER NOT NULL DEFAULT 0;
