import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';
import { WeeklyCommission } from '@/entity/weeklycommission/weeklycommission.entity';

export const memberForWeeklyCommissionStatusLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Member>(
    async (memberIds: string[]) => {
      const members = await parent.prisma.member.findMany({
        where: { id: { in: memberIds } },
      });

      const membersMap: Record<string, Member> = {};
      members.forEach((member) => {
        membersMap[member.id] = member;
      });

      return memberIds.map((id) => membersMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const weeklyCommissionsForWeeklyCommissionStatusLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, WeeklyCommission>(
    async (commissionIds: string[]) => {
      const weeklyCommissions = await parent.prisma.weeklyCommission.findMany({
        where: {
          id: {
            in: commissionIds,
          },
          status: {
            in: parent.isAdmin ? ['BLOCK', 'CONFIRM', 'PENDING', 'NONE'] : ['BLOCK', 'CONFIRM'],
          },
        },
      });
      console.log(weeklyCommissions);

      const resMap: Record<string, WeeklyCommission> = {};
      weeklyCommissions.forEach((commission) => {
        resMap[commission.id] = commission;
      });

      return commissionIds.map((id) => resMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
