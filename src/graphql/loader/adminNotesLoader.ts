import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';
import { Admin } from '@/entity/admin/admin.entity';

export const memberForAdminNotesLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Member>(
    async (memberIds: string[]) => {
      const members = await parent.prisma.member.findMany({
        where: { id: { in: memberIds } },
      });

      const memberMap: Record<string, Member> = {};
      members.forEach((member) => {
        member[member.id] = member;
      });

      return memberIds.map((id) => memberMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const adminForAdminNotesLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Admin>(
    async (adminIds: string[]) => {
      const admins = await parent.prisma.admin.findMany({
        where: { id: { in: adminIds } },
      });

      const adminMap: Record<string, Admin> = {};
      admins.forEach((admin) => {
        adminMap[admin.id] = admin;
      });

      return adminIds.map((id) => adminMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
