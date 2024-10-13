/*
  Warnings:

  - The `status` column on the `weeklycommissions` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Confirmation4Status" AS ENUM ('NONE', 'PENDING', 'CONFIRM', 'BLOCK');

-- AlterTable
ALTER TABLE "weeklycommissions" DROP COLUMN "status",
ADD COLUMN     "status" "Confirmation4Status" NOT NULL DEFAULT 'NONE';

-- DropEnum
DROP TYPE "Confirmation3Status";
