/*
  Warnings:

  - The `status` column on the `weeklycommissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Confirmation3Status" AS ENUM ('PENDING', 'CONFIRM', 'BLOCK');

-- AlterTable
ALTER TABLE "weeklycommissions" DROP COLUMN "status",
ADD COLUMN     "status" "Confirmation3Status" NOT NULL DEFAULT 'PENDING';
