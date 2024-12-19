import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { GroupSettingCommissionBonus, Prisma } from '@prisma/client';
import { Package } from '@/entity/package/package.entity';

export const groupSettingCommissionBonusesForGroupSettingLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, GroupSettingCommissionBonus[]>(
    async (groupSettingIds: string[]) => {
      const groupSettingCommissionBonuses =
        await parent.prisma.groupSettingCommissionBonus.findMany({
          where: {
            groupSettingId: {
              in: groupSettingIds,
            },
          },
        });
      const commissionBonusMap: Record<string, GroupSettingCommissionBonus[]> = {};
      groupSettingCommissionBonuses.forEach((commissionBonus) => {
        if (!commissionBonusMap[commissionBonus.groupSettingId]) {
          commissionBonusMap[commissionBonus.groupSettingId] = [];
        }
        commissionBonusMap[commissionBonus.groupSettingId].push(commissionBonus);
      });

      return groupSettingIds.map((id) => commissionBonusMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const sponsorBonusPackageForGroupSettingLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Package>(
    async (packageIds: string[]) => {
      const packages = await parent.prisma.package.findMany({
        where: {
          id: {
            in: packageIds,
          },
        },
      });
      const packageMap: Record<string, Package> = {};
      packages.forEach((pkg) => {
        packageMap[pkg.id] = pkg;
      });

      return packageIds.map((id) => packageMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
