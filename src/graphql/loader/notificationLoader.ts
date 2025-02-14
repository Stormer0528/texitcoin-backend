import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';
import { UserRole } from '@/type';
import { Prisma } from '@prisma/client';

export const totalMembersForNotificationLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, number>(
    async (notificationIds: string[]) => {
      const membersCount = await parent.prisma.notificationClient.groupBy({
        by: ['notificationId'],
        where: {
          notificationId: {
            in: notificationIds,
          },
          clientType: UserRole.MEMBER,
        },
        _count: true,
      });
      const memberCountMap: Record<string, number> = {};
      membersCount.forEach((mbc) => {
        memberCountMap[mbc.notificationId] = mbc._count;
      });

      return notificationIds.map((id) => memberCountMap[id] ?? 0);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const readMembersForNotificationLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, number>(
    async (notificationIds: string[]) => {
      const membersCount = await parent.prisma.notificationClient.groupBy({
        by: ['notificationId'],
        where: {
          notificationId: {
            in: notificationIds,
          },
          clientType: UserRole.MEMBER,
          read: true,
        },
        _count: true,
      });
      const memberCountMap: Record<string, number> = {};
      membersCount.forEach((mbc) => {
        memberCountMap[mbc.notificationId] = mbc._count;
      });

      return notificationIds.map((id) => memberCountMap[id] ?? 0);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const membersForNotificationLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Member[]>(
    async (notificationIds: string[]) => {
      const notificationsWithMember = await parent.prisma.$queryRaw<any>`
        SELECT "notificationclients"."notificationId", members.*
        FROM "notificationclients"
        LEFT JOIN "members" ON "members"."id" = "notificationclients"."clientId"
        WHERE "notificationclients"."clientType"::Text = 'MEMBER'
              AND "notificationclients"."notificationId" in (${Prisma.join(notificationIds)})
      `;
      const membersMap: Record<string, Member[]> = {};
      notificationsWithMember.forEach((notification) => {
        if (!membersMap[notification.notificationId]) membersMap[notification.notificationId] = [];
        membersMap[notification.notificationId].push(notification);
      });

      return notificationIds.map((id) => membersMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
