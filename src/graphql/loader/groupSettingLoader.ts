import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';
import { UserRole } from '@/type';
import { GroupSettingCommissionBonus, Prisma } from '@prisma/client';

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
