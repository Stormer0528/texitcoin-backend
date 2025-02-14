-- CreateEnum
CREATE TYPE "TeamReport" AS ENUM ('NONE', 'LEFT', 'RIGHT', 'ALL');

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "teamReport" "TeamReport" NOT NULL DEFAULT 'NONE';
