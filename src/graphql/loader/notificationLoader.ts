import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Sale } from '@/entity/sale/sale.entity';
import { MemberStatistics } from '@/entity/memberStatistics/memberStatistics.entity';
import { MemberWallet } from '@/entity/memberWallet/memberWallet.entity';
import { Member } from '@/entity/member/member.entity';
import { AdminNotes, WeeklyCommission } from '@prisma/client';
import { ConfirmationStatus } from '../enum';
import { CommissionStatus } from '@/entity/weeklycommission/weeklycommission.type';
import dayjs from 'dayjs';

export const totalMembersForNotificationLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, number>(
    async (notificationIds: string[]) => {
      const membersCount = await parent.prisma.notificationMember.groupBy({
        by: ['notificationId'],
        where: {
          notificationId: {
            in: notificationIds,
          },
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
      const membersCount = await parent.prisma.notificationMember.groupBy({
        by: ['notificationId'],
        where: {
          notificationId: {
            in: notificationIds,
          },
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
      const notificationsWithMember = await parent.prisma.notificationMember.findMany({
        where: {
          notificationId: {
            in: notificationIds,
          },
        },
        include: {
          member: true,
        },
      });
      const membersMap: Record<string, Member[]> = {};
      notificationsWithMember.forEach((notification) => {
        if (!membersMap[notification.id]) membersMap[notification.id] = [];
        membersMap[notification.id].push(notification.member);
      });

      return notificationIds.map((id) => membersMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
