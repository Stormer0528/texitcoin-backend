import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';
import { Package } from '@/entity/package/package.entity';
import { StatisticsSale } from '@/entity/statisticsSale/statisticsSale.entity';
import { Proof } from '@/entity/proof/proof.entity';

export const memberForSaleLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Member>(
    async (memberIds: string[]) => {
      const uniqueMemberIds = [...new Set(memberIds)];
      const members = await parent.prisma.member.findMany({
        where: { id: { in: uniqueMemberIds } },
      });

      const membersMap: Record<string, Member> = {};
      members.forEach((member) => {
        membersMap[member.id] = member;
      });

      return uniqueMemberIds.map((id) => membersMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const packageForSaleLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Package>(
    async (packageIds: string[]) => {
      const uniquePackageIds = [...new Set(packageIds)];
      const packages = await parent.prisma.package.findMany({
        where: { id: { in: uniquePackageIds } },
      });

      const packagesMap: Record<string, Package> = {};
      packages.forEach((pkg) => {
        packagesMap[pkg.id] = pkg;
      });

      return uniquePackageIds.map((id) => packagesMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const statisticsSalesForSaleLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, StatisticsSale[]>(
    async (saleIds: string[]) => {
      const statisticsSales = await parent.prisma.statisticsSale.findMany({
        where: { saleId: { in: saleIds } },
      });

      const statisticsSalesMap: Record<string, StatisticsSale[]> = {};
      statisticsSales.forEach((statisticsSale) => {
        if (!statisticsSalesMap[statisticsSale.saleId])
          statisticsSalesMap[statisticsSale.saleId] = [];
        statisticsSalesMap[statisticsSale.saleId].push(statisticsSale);
      });

      return saleIds.map((id) => statisticsSalesMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const proofForSaleLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Proof>(
    async (saleIds: string[]) => {
      const proofs = await parent.prisma.proof.findMany({
        where: {
          refId: {
            in: saleIds,
          },
          type: 'SALE',
        },
      });

      const proofsMap: Record<string, Proof> = {};
      proofs.forEach((proof) => {
        proofsMap[proof.refId] = proof;
      });

      return saleIds.map((id) => proofs[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
