-- CreateEnum
CREATE TYPE "ProofType" AS ENUM ('COMMISSION', 'MINE', 'INFRASTRUCTURE', 'OVERHEAD', 'SALARY', 'PROMOTION', 'PROFIT');

-- AlterTable
ALTER TABLE "filerelations" ADD COLUMN     "proofId" TEXT;

-- CreateTable
CREATE TABLE "proofs" (
    "id" TEXT NOT NULL,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "ProofType" NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "proofs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "filerelations" ADD CONSTRAINT "filerelations_proofId_fkey" FOREIGN KEY ("proofId") REFERENCES "proofs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
