-- AlterTable
ALTER TABLE "members" ALTER COLUMN "ID" DROP NOT NULL,
ALTER COLUMN "ID" DROP DEFAULT,
ALTER COLUMN "ID" SET DATA TYPE TEXT;
DROP SEQUENCE "members_ID_seq";

UPDATE members SET "ID" = CONCAT('M-', LPAD("ID"::TEXT, 7, '0'));
