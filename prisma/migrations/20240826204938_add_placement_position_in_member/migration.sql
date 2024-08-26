-- CreateEnum
CREATE TYPE "PlacementPosition" AS ENUM ('LEFT', 'RIGHT');

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "placementPosition" "PlacementPosition" DEFAULT 'LEFT';
