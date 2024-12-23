-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "toMemberId" TEXT;

-- CreateTable
CREATE TABLE "balances" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "amountInCents" INTEGER NOT NULL,
    "balance" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "balances_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_toMemberId_fkey" FOREIGN KEY ("toMemberId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
