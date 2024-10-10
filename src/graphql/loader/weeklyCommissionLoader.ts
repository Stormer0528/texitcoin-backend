import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';
import { WeeklyCommissionStatus } from '@/entity/weeklycommissionstatus/weeklyCommissionStatus.entity';

export const memberForWeeklyCommissionLoader = (parent: RootDataLoader) => {
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

export const weeklyCommissionStatusesForWeeklyCommissionLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, WeeklyCommissionStatus>(
    async (commissionIds: string[]) => {
      const weeklyCommissionStatuses = await parent.prisma.weeklyCommissionStatus.findMany({
        where: {
          weeklyCommissionId: {
            in: commissionIds,
          },
        },
      });

      const resMap: Record<string, WeeklyCommissionStatus> = {};
      weeklyCommissionStatuses.forEach((commissionStatus) => {
        resMap[commissionStatus.weeklyCommissionId] = commissionStatus;
      });

      return commissionIds.map((id) => resMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
