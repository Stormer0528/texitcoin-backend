/*
  Warnings:

  - The values [NONE] on the enum `MemberState` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MemberState_new" AS ENUM ('PENDING', 'GRAVEYARD', 'APPROVED');
ALTER TABLE "members" ALTER COLUMN "allowState" DROP DEFAULT;
ALTER TABLE "members" ALTER COLUMN "allowState" TYPE "MemberState_new" USING ("allowState"::text::"MemberState_new");
ALTER TYPE "MemberState" RENAME TO "MemberState_old";
ALTER TYPE "MemberState_new" RENAME TO "MemberState";
DROP TYPE "MemberState_old";
ALTER TABLE "members" ALTER COLUMN "allowState" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "members" ALTER COLUMN "allowState" SET DEFAULT 'PENDING';
