-- DropForeignKey
ALTER TABLE "members" DROP CONSTRAINT "members_sponsorId_fkey";

-- DropForeignKey
ALTER TABLE "memberstatisticswallets" DROP CONSTRAINT "memberstatisticswallets_memberStatisticId_fkey";

-- DropForeignKey
ALTER TABLE "memberstatisticswallets" DROP CONSTRAINT "memberstatisticswallets_memberWalletId_fkey";

-- DropForeignKey
ALTER TABLE "memberwallets" DROP CONSTRAINT "memberwallets_memberId_fkey";

-- DropForeignKey
ALTER TABLE "memberwallets" DROP CONSTRAINT "memberwallets_payoutId_fkey";

-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_memberId_fkey";

-- DropForeignKey
ALTER TABLE "sales" DROP CONSTRAINT "sales_packageId_fkey";

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "packages"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "memberwallets" ADD CONSTRAINT "memberwallets_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "memberwallets" ADD CONSTRAINT "memberwallets_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "payouts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "memberstatisticswallets" ADD CONSTRAINT "memberstatisticswallets_memberStatisticId_fkey" FOREIGN KEY ("memberStatisticId") REFERENCES "member_statistics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "memberstatisticswallets" ADD CONSTRAINT "memberstatisticswallets_memberWalletId_fkey" FOREIGN KEY ("memberWalletId") REFERENCES "memberwallets"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
