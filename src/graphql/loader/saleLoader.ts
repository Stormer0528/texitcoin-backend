import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Member } from '@/entity/member/member.entity';
import { Package } from '@/entity/package/package.entity';
import { StatisticsSale } from '@/entity/statisticsSale/statisticsSale.entity';
import { PFile } from '@/entity/file/file.entity';
import { RefLink } from '@/entity/referenceLink/referenceLink.entity';

export const memberForSaleLoader = (parent: RootDataLoader) => {
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

export const packageForSaleLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Package>(
    async (packageIds: string[]) => {
      const uniquePackageIds = [...new Set(packageIds)];
      const packages = await parent.prisma.package.findMany({
        where: { id: { in: uniquePackageIds } },
      });

      const packagesMap: Record<string, Package> = {};
      packages.forEach((pkg) => {
        packagesMap[pkg.id] = pkg;
      });

      return uniquePackageIds.map((id) => packagesMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const statisticsSalesForSaleLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, StatisticsSale[]>(
    async (saleIds: string[]) => {
      const statisticsSales = await parent.prisma.statisticsSale.findMany({
        where: { saleId: { in: saleIds } },
      });

      const statisticsSalesMap: Record<string, StatisticsSale[]> = {};
      statisticsSales.forEach((statisticsSale) => {
        if (!statisticsSalesMap[statisticsSale.saleId])
          statisticsSalesMap[statisticsSale.saleId] = [];
        statisticsSalesMap[statisticsSale.saleId].push(statisticsSale);
      });

      return saleIds.map((id) => statisticsSalesMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const filesForSaleLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, PFile[]>(
    async (saleIds: string[]) => {
      const salesWithFile = await parent.prisma.fileRelation.findMany({
        where: {
          saleId: {
            in: saleIds,
          },
        },
        select: {
          saleId: true,
          file: true,
        },
      });

      const filesMap: Record<string, PFile[]> = {};
      salesWithFile.forEach((sale) => {
        if (!filesMap[sale.saleId]) {
          filesMap[sale.saleId] = [];
        }
        filesMap[sale.saleId].push(sale.file);
      });

      return saleIds.map((id) => filesMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const referenceLinksForSaleLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, RefLink[]>(
    async (saleIds: string[]) => {
      const salesWithLinks = await parent.prisma.referenceLink.findMany({
        where: {
          saleId: {
            in: saleIds,
          },
        },
        select: {
          saleId: true,
          link: true,
          linkType: true,
        },
      });

      const linksMap: Record<string, RefLink[]> = {};
      salesWithLinks.forEach((sale) => {
        if (!linksMap[sale.saleId]) {
          linksMap[sale.saleId] = [];
        }
        linksMap[sale.saleId].push({
          link: sale.link,
          linkType: sale.linkType,
        });
      });

      return saleIds.map((id) => linksMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
