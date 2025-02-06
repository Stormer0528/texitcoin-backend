/*
  Warnings:

  - The values [PREPAY] on the enum `ProofType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `prepaidcommissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProofType_new" AS ENUM ('COMMISSION', 'MINENEWEQUIPMENT', 'MINEELECTRICITY', 'MINEMAINTAINANCE', 'MINEFACILITYRENTMORTAGE', 'MARKETINGTXCPROMOTION', 'MARKETINGMINETXCPROMOTION', 'INFRASTRUCTURE', 'OVERHEAD', 'ADMINISTRATIONSALARY', 'PROMOTION', 'PROFIT', 'SALE', 'DEVELOPERSPROTOCOL', 'DEVELOPERSWEB', 'DEVELOPERSAPPS', 'DEVELOPERSINTEGRATIONS', 'EXCHANGEFEE', 'TRANSACTIONPROCESSING');
ALTER TABLE "proofs" ALTER COLUMN "type" TYPE "ProofType_new" USING ("type"::text::"ProofType_new");
ALTER TYPE "ProofType" RENAME TO "ProofType_old";
ALTER TYPE "ProofType_new" RENAME TO "ProofType";
DROP TYPE "ProofType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "prepaidcommissions" DROP CONSTRAINT "prepaidcommissions_commissionId_fkey";

-- DropTable
DROP TABLE "prepaidcommissions";
