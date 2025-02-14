-- CreateTable
CREATE TABLE "weeklycommissions" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "weekStartDate" TIMESTAMP(3) NOT NULL,
    "leftPoint" INTEGER NOT NULL DEFAULT 0,
    "rightPoint" INTEGER NOT NULL DEFAULT 0,
    "commission" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "weeklycommissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "weeklycommissions" ADD CONSTRAINT "weeklycommissions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
