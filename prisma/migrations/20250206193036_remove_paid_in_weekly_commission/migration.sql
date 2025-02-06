/*
  Warnings:

  - The values [PAID] on the enum `ConfirmationStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
UPDATE weeklycommissions SET status = 'APPROVED' WHERE status = 'PAID';
BEGIN;
CREATE TYPE "ConfirmationStatus_new" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'DECLINED', 'PREVIEW');
ALTER TABLE "weeklycommissions" ADD COLUMN "status_new" "ConfirmationStatus_new" NOT NULL DEFAULT 'NONE';
UPDATE "weeklycommissions" SET "status_new" = "status"::TEXT::"ConfirmationStatus_new";
ALTER TABLE "weeklycommissions" DROP COLUMN "status";
ALTER TABLE "weeklycommissions" RENAME COLUMN "status_new" TO "status";
ALTER TYPE "ConfirmationStatus" RENAME TO "ConfirmationStatus_old";
ALTER TYPE "ConfirmationStatus_new" RENAME TO "ConfirmationStatus";
DROP TYPE "ConfirmationStatus_old";
COMMIT;
