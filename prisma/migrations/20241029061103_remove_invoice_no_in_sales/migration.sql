/*
  Warnings:

  - You are about to drop the column `invoiceNo` on the `sales` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "index_sales_on_invoiceNo";

-- AlterTable
ALTER TABLE "sales" DROP COLUMN "invoiceNo";
