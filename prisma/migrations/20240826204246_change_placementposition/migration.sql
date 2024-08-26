/*
  Warnings:

  - The values [NONE] on the enum `PlacementPosition` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PlacementPosition_new" AS ENUM ('LEFT', 'RIGHT');
ALTER TABLE "members" ALTER COLUMN "placementPosition" DROP DEFAULT;
ALTER TABLE "members" ALTER COLUMN "placementPosition" TYPE "PlacementPosition_new" USING ("placementPosition"::text::"PlacementPosition_new");
ALTER TYPE "PlacementPosition" RENAME TO "PlacementPosition_old";
ALTER TYPE "PlacementPosition_new" RENAME TO "PlacementPosition";
DROP TYPE "PlacementPosition_old";
ALTER TABLE "members" ALTER COLUMN "placementPosition" SET DEFAULT 'LEFT';
COMMIT;

-- AlterTable
ALTER TABLE "members" ALTER COLUMN "placementPosition" SET DEFAULT 'LEFT';
