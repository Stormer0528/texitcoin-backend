-- CreateEnum
CREATE TYPE "MemberState" AS ENUM ('NONE', 'GRAVEYARD');

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "allowState" "MemberState" DEFAULT 'NONE';
