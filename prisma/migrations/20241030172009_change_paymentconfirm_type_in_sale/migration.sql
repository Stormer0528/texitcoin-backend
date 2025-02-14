/*
  Warnings:

  - The `paymentConfirm` column on the `sales` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "sales" DROP COLUMN "paymentConfirm",
ADD COLUMN     "paymentConfirm" TEXT[];
