/*
  Warnings:

  - Made the column `placementPosition` on table `members` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "members" ALTER COLUMN "placementPosition" SET DEFAULT 'NONE';

UPDATE members SET "placementPosition" = 'NONE'::"PlacementPosition" WHERE "placementPosition" IS NULL;

ALTER TABLE "members" ALTER COLUMN "placementPosition" SET NOT NULL;
