import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Sale } from '@/entity/sale/sale.entity';
import { MemberStatistics } from '@/entity/memberStatistics/memberStatistics.entity';
import { MemberWallet } from '@/entity/memberWallet/memberWallet.entity';
import { Member } from '@/entity/member/member.entity';
import { AdminNotes, WeeklyCommission } from '@prisma/client';

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
            in: parent.isAdmin ? ['BLOCK', 'CONFIRM', 'PENDING', 'NONE'] : ['BLOCK', 'CONFIRM'],
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
