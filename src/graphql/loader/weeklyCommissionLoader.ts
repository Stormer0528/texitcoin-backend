import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';
import { PFile } from '@/entity/file/file.entity';
import { RefLink } from '@/entity/referenceLink/referenceLink.entity';

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

export const filesForWeeklyCommissionLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, PFile[]>(
    async (commissionIds: string[]) => {
      const commissionsWithFile = await parent.prisma.fileRelation.findMany({
        where: {
          commissionId: {
            in: commissionIds,
          },
        },
        select: {
          commissionId: true,
          file: true,
        },
      });

      const filesMap: Record<string, PFile[]> = {};
      commissionsWithFile.forEach((commission) => {
        if (!filesMap[commission.commissionId]) {
          filesMap[commission.commissionId] = [];
        }
        filesMap[commission.commissionId].push(commission.file);
      });

      return commissionIds.map((id) => filesMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const referenceLinksForCommissionLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, RefLink[]>(
    async (commissionIds: string[]) => {
      const commissionsWithLinks = await parent.prisma.referenceLink.findMany({
        where: {
          commissionId: {
            in: commissionIds,
          },
        },
        select: {
          commissionId: true,
          link: true,
          linkType: true,
        },
      });

      const linksMap: Record<string, RefLink[]> = {};
      commissionsWithLinks.forEach((commission) => {
        if (!linksMap[commission.commissionId]) {
          linksMap[commission.commissionId] = [];
        }
        linksMap[commission.commissionId].push({
          link: commission.link,
          linkType: commission.linkType,
        });
      });

      return commissionIds.map((id) => linksMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
