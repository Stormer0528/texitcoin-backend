-- AlterTable
ALTER TABLE "members" ADD COLUMN     "placementParentId" VARCHAR;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_placementParentId_fkey" FOREIGN KEY ("placementParentId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
