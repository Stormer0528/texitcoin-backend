import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';
import { PFile } from '@/entity/file/file.entity';
import { Sale } from '@/entity/sale/sale.entity';
import { RefLink } from '@/entity/referenceLink/referenceLink.entity';

export const memberForPrepaidCommissionLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Member>(
    async (memberIds: string[]) => {
      const uniqueMemberIds = [...new Set(memberIds)];
      const members = await parent.prisma.member.findMany({
        where: { id: { in: uniqueMemberIds } },
      });

      const membersMap: Record<string, Member> = {};
      members.forEach((member) => {
        membersMap[member.id] = member;
      });

      return uniqueMemberIds.map((id) => membersMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const filesForPrepaidCommissionLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, PFile[]>(
    async (prepaidCommissionIds: string[]) => {
      const prepaidsWithFile = await parent.prisma.fileRelation.findMany({
        where: {
          prepaidCommissionId: {
            in: prepaidCommissionIds,
          },
        },
        select: {
          prepaidCommissionId: true,
          file: true,
        },
      });

      const filesMap: Record<string, PFile[]> = {};
      prepaidsWithFile.forEach((prepay) => {
        if (!filesMap[prepay.prepaidCommissionId]) {
          filesMap[prepay.prepaidCommissionId] = [];
        }
        filesMap[prepay.prepaidCommissionId].push(prepay.file);
      });

      return prepaidCommissionIds.map((id) => filesMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const referenceLinksForPrepaidCommissionLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, RefLink[]>(
    async (prepaidCommissionIds: string[]) => {
      const prepaidsWithLinks = await parent.prisma.referenceLink.findMany({
        where: {
          prepaidCommissionId: {
            in: prepaidCommissionIds,
          },
        },
        select: {
          prepaidCommissionId: true,
          link: true,
          linkType: true,
        },
      });

      const linksMap: Record<string, RefLink[]> = {};
      prepaidsWithLinks.forEach((prepay) => {
        if (!linksMap[prepay.prepaidCommissionId]) {
          linksMap[prepay.prepaidCommissionId] = [];
        }
        linksMap[prepay.prepaidCommissionId].push({
          link: prepay.link,
          linkType: prepay.linkType,
        });
      });

      return prepaidCommissionIds.map((id) => linksMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
