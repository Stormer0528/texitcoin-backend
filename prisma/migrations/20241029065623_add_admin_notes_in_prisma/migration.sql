-- CreateTable
CREATE TABLE "adminnotes" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "adminnotes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "adminnotes" ADD CONSTRAINT "adminnotes_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "adminnotes" ADD CONSTRAINT "adminnotes_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
