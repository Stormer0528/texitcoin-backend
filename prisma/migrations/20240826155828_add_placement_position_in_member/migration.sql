-- CreateEnum
CREATE TYPE "PlacementPosition" AS ENUM ('LEFT', 'RIGHT', 'NONE');

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "placementPosition" "PlacementPosition" DEFAULT 'NONE';
