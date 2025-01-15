import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Sale } from '@/entity/sale/sale.entity';
import { MemberStatistics } from '@/entity/memberStatistics/memberStatistics.entity';
import { MemberWallet } from '@/entity/memberWallet/memberWallet.entity';
import { Member } from '@/entity/member/member.entity';
import { AdminNotes, Balance, WeeklyCommission } from '@prisma/client';
import { ConfirmationStatus } from '../enum';
import { CommissionStatus } from '@/entity/weeklycommission/weeklycommission.type';
import dayjs from 'dayjs';

export const salesForMemberLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Sale[]>(
    async (memberIds: string[]) => {
      const sales = await parent.prisma.sale.findMany({
        where: {
          memberId: {
            in: memberIds,
          },
          status: true,
        },
      });
      const membersWithSalesMap: Record<string, Sale[]> = {};
      sales.forEach((sale) => {
        if (!membersWithSalesMap[sale.memberId]) membersWithSalesMap[sale.memberId] = [];
        membersWithSalesMap[sale.memberId].push(sale);
      });

      return memberIds.map((id) => membersWithSalesMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const memberStatisticsForMemberLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, MemberStatistics[]>(
    async (memberIds: string[]) => {
      const memberStatistics = await parent.prisma.memberStatistics.findMany({
        where: { memberId: { in: memberIds } },
      });

      const membersWithMemberStatisticsMap: Record<string, MemberStatistics[]> = {};
      memberStatistics.forEach((memberStatistics) => {
        if (!membersWithMemberStatisticsMap[memberStatistics.memberId])
          membersWithMemberStatisticsMap[memberStatistics.memberId] = [];
        membersWithMemberStatisticsMap[memberStatistics.memberId].push(memberStatistics);
      });

      return memberIds.map((id) => membersWithMemberStatisticsMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const memberWalletsForMemberLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, MemberWallet[]>(
    async (memberIds: string[]) => {
      const memberWallets = await parent.prisma.memberWallet.findMany({
        where: { memberId: { in: memberIds }, deletedAt: null },
      });

      const memberWahlletsMap: Record<string, MemberWallet[]> = {};
      memberWallets.forEach((memberWallet) => {
        if (!memberWahlletsMap[memberWallet.memberId])
          memberWahlletsMap[memberWallet.memberId] = [];
        memberWahlletsMap[memberWallet.memberId].push(memberWallet);
      });

      return memberIds.map((id) => memberWahlletsMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const sponsorForMemberLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Member>(
    async (sponsorIds: string[]) => {
      const uniqueSponsorIds = [...new Set(sponsorIds)];
      const sponsors = await parent.prisma.member.findMany({
        where: { id: { in: uniqueSponsorIds } },
      });

      const sponsorMap: Record<string, Member> = {};
      sponsors.forEach((sponsor) => {
        sponsorMap[sponsor.id] = sponsor;
      });

      return uniqueSponsorIds.map((id) => sponsorMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const introduceMembersForMemberLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Member[]>(
    async (memberIds: string[]) => {
      const introduceMembers = await parent.prisma.member.findMany({
        where: { sponsorId: { in: memberIds } },
      });

      const introduceMembersMap: Record<string, Member[]> = {};

      introduceMembers.forEach((introducer) => {
        if (!introduceMembersMap[introducer.sponsorId])
          introduceMembersMap[introducer.sponsorId] = [];
        introduceMembersMap[introducer.sponsorId].push(introducer);
      });

      return memberIds.map((id) => introduceMembersMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const placementParentForMemberLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Member>(
    async (placementParentIds: string[]) => {
      const uniquePlacementParentIds = [...new Set(placementParentIds)];
      const parents = await parent.prisma.member.findMany({
        where: { id: { in: uniquePlacementParentIds } },
      });

      const parentMap: Record<string, Member> = {};
      parents.forEach((parent) => {
        parentMap[parent.id] = parent;
      });

      return uniquePlacementParentIds.map((id) => parentMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const placementChildrenForMemberLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Member[]>(
    async (memberIds: string[]) => {
      const children = await parent.prisma.member.findMany({
        where: { placementParentId: { in: memberIds } },
      });

      const childrenMap: Record<string, Member[]> = {};

      children.forEach((child) => {
        if (!childrenMap[child.placementParentId]) childrenMap[child.placementParentId] = [];
        childrenMap[child.placementParentId].push(child);
      });

      return memberIds.map((id) => childrenMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const weeklyCommissionsForMemberLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, WeeklyCommission[]>(
    async (memberIds: string[]) => {
      const weeklyCommissions = await parent.prisma.weeklyCommission.findMany({
        where: {
          memberId: {
            in: memberIds,
          },
          status: {
            in: parent.isAdmin
              ? [
                  ConfirmationStatus.DECLINED,
                  ConfirmationStatus.PAID,
                  ConfirmationStatus.APPROVED,
                  ConfirmationStatus.PENDING,
                  ConfirmationStatus.NONE,
                  ConfirmationStatus.PREVIEW,
                ]
              : [ConfirmationStatus.DECLINED, ConfirmationStatus.APPROVED, ConfirmationStatus.PAID],
          },
        },
      });

      const weeklyCommissionMap: Record<string, WeeklyCommission[]> = {};

      weeklyCommissions.forEach((weeklyCommission) => {
        if (!weeklyCommissionMap[weeklyCommission.memberId])
          weeklyCommissionMap[weeklyCommission.memberId] = [];
        weeklyCommissionMap[weeklyCommission.memberId].push(weeklyCommission);
      });

      return memberIds.map((id) => weeklyCommissionMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const adminNotesForMemberLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, AdminNotes[]>(
    async (memberIds: string[]) => {
      const adminNotes = await parent.prisma.adminNotes.findMany({
        where: {
          memberId: {
            in: memberIds,
          },
        },
      });
      const membersWithAdminNotesMap: Record<string, AdminNotes[]> = {};
      adminNotes.forEach((adaminNotes) => {
        if (!membersWithAdminNotesMap[adaminNotes.memberId])
          membersWithAdminNotesMap[adaminNotes.memberId] = [];
        membersWithAdminNotesMap[adaminNotes.memberId].push(adaminNotes);
      });

      return memberIds.map((id) => membersWithAdminNotesMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const commissionStatusForMemberLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, CommissionStatus>(
    async (memberIds: string[]) => {
      const weeklyCommissions = await parent.prisma.weeklyCommission.findMany({
        where: {
          memberId: {
            in: memberIds,
          },
          status: 'PREVIEW',
          weekStartDate: dayjs().utc().startOf('week').toDate(),
        },
      });

      const commissionStatusMap: Record<string, CommissionStatus> = {};

      weeklyCommissions.forEach((weeklyCommission) => {
        commissionStatusMap[weeklyCommission.memberId] = {
          begL: weeklyCommission.begL,
          begR: weeklyCommission.begR,
          newL: weeklyCommission.newL,
          newR: weeklyCommission.newR,
        };
      });

      return memberIds.map((id) => commissionStatusMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const commissionCountForMemberLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, number>(
    async (memberIds: string[]) => {
      const weeklyCommissions = await parent.prisma.weeklyCommission.groupBy({
        by: ['memberId'],
        where: {
          memberId: {
            in: memberIds,
          },
          status: {
            not: 'PREVIEW',
          },
        },
        _count: true,
      });

      const commissionStatusMap: Record<string, number> = {};
      weeklyCommissions.forEach((weeklyCommission) => {
        commissionStatusMap[weeklyCommission.memberId] = weeklyCommission._count;
      });

      return memberIds.map((id) => commissionStatusMap[id] ?? 0);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const groupNameForMemberLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, string>(
    async (memberIds: string[]) => {
      const members = await parent.prisma.member.findMany({
        where: {
          id: {
            in: memberIds,
          },
        },
        select: {
          id: true,
          createdAt: true,
        },
      });
      const membersMap: Record<string, Date> = {};
      members.forEach((member) => (membersMap[member.id] = member.createdAt));

      const groupSettings = await parent.prisma.groupSetting.findMany({
        orderBy: {
          limitDate: 'asc',
        },
        select: {
          limitDate: true,
          name: true,
        },
      });
      const findGroupName = (date: Date) => {
        const group = groupSettings.find((groupSetting) => date <= groupSetting.limitDate);
        return group ? group.name : '';
      };

      return memberIds.map((id) => findGroupName(membersMap[id]));
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const balancesForMemberLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Balance[]>(
    async (memberIds: string[]) => {
      const balances = await parent.prisma.balance.findMany({
        where: {
          memberId: {
            in: memberIds,
          },
        },
      });
      const balanceMap: Record<string, Balance[]> = {};
      balances.forEach((balance) => {
        if (!balanceMap[balance.memberId]) {
          balanceMap[balance.memberId] = [];
        }
        balanceMap[balance.memberId].push(balance);
      });

      return memberIds.map((id) => balanceMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const balanceForMemberLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, number>(
    async (memberIds: string[]) => {
      const balances = await parent.prisma.balance.groupBy({
        by: ['memberId'],
        where: {
          memberId: {
            in: memberIds,
          },
        },
        _sum: {
          amountInCents: true,
        },
      });
      const balanceMap: Record<string, number> = {};
      balances.forEach((balance) => {
        balanceMap[balance.memberId] = balance._sum.amountInCents;
      });

      return memberIds.map((id) => balanceMap[id] ?? 0);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
