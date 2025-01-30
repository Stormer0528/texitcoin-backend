import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';

export const memberForBalanceLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Member>(
    async (memberIds: string[]) => {
      const members = await parent.prisma.member.findMany({
        where: {
          id: {
            in: memberIds,
          },
        },
      });
      const memberMap: Record<string, Member> = {};
      members.forEach((member) => {
        memberMap[member.id] = member;
      });

      return memberIds.map((id) => memberMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
