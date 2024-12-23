/*
  Warnings:

  - You are about to drop the column `balance` on the `balances` table. All the data in the column will be lost.
  - Added the required column `balanceInCents` to the `balances` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "balances" DROP COLUMN "balance",
ADD COLUMN     "balanceInCents" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "balanceInCents" INTEGER NOT NULL DEFAULT 0;
