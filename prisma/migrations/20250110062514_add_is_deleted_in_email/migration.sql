-- AlterTable
ALTER TABLE "emails" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "recipients" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
