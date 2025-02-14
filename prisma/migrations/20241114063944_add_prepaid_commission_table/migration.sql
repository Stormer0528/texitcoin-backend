-- CreateTable
CREATE TABLE "prepaidcommissions" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "saleId" TEXT,
    "note" TEXT,
    "pkgL" INTEGER NOT NULL DEFAULT 0,
    "pkgR" INTEGER NOT NULL DEFAULT 0,
    "commission" INTEGER NOT NULL DEFAULT 0,
    "orderedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weekStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "prepaidcommissions_pkey" PRIMARY KEY ("id")
);
