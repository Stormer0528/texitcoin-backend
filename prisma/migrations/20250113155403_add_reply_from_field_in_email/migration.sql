-- AlterTable
ALTER TABLE "emails" ADD COLUMN     "replyFromId" TEXT;

-- AddForeignKey
ALTER TABLE "emails" ADD CONSTRAINT "emails_replyFromId_fkey" FOREIGN KEY ("replyFromId") REFERENCES "emails"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
