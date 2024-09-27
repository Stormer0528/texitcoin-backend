import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';

export const memberForWeeklyCommissionLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Member>(
    async (weeklyCommissionIds: string[]) => {
      const weeklyCommissionsWithMember = await parent.prisma.weeklyCommission.findMany({
        where: { memberId: { in: weeklyCommissionIds } },
        include: {
          member: true,
        },
      });

      const membersMap: Record<string, Member> = {};
      weeklyCommissionsWithMember.forEach((weeklyCommission) => {
        membersMap[weeklyCommission.id] = weeklyCommission.member;
      });

      return weeklyCommissionIds.map((id) => membersMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
