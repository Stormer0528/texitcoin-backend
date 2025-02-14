-- CreateEnum
CREATE TYPE "TeamStrategy" AS ENUM ('LEFT', 'RIGHT', 'BALANCE', 'MANUAL');

-- AlterTable
ALTER TABLE "members" ADD COLUMN     "teamStrategy" "TeamStrategy" NOT NULL DEFAULT 'MANUAL';

UPDATE "members"
SET "teamStrategy" = CASE 
    WHEN "placementParentId" IS NOT NULL AND "placementPosition" = 'LEFT' THEN 'RIGHT'::"TeamStrategy"
    WHEN "placementParentId" IS NOT NULL AND "placementPosition" = 'RIGHT' THEN 'LEFT'::"TeamStrategy"
    ELSE 'MANUAL'::"TeamStrategy"
END;