/*
  Warnings:

  - You are about to drop the column `leftPoint` on the `weeklycommissions` table. All the data in the column will be lost.
  - You are about to drop the column `rightPoint` on the `weeklycommissions` table. All the data in the column will be lost.
  - The `status` column on the `weeklycommissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Confirmation4Status" AS ENUM ('NONE', 'PENDING', 'CONFIRM', 'BLOCK');

-- AlterTable
ALTER TABLE "weeklycommissions" DROP COLUMN "leftPoint",
DROP COLUMN "rightPoint",
ADD COLUMN     "afterLeftPoint" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "afterRightPoint" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "beforeLeftPoint" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "beforeRightPoint" INTEGER NOT NULL DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "Confirmation4Status" NOT NULL DEFAULT 'NONE';
