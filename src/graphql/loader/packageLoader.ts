import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Sale } from '@/entity/sale/sale.entity';
import { PaymentMethodLink } from '@/entity/paymentMethodLink/paymentMethodLink.entity';

export const salesForPackageLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Sale[]>(
    async (packageIds: string[]) => {
      const sales = await parent.prisma.sale.findMany({
        where: { packageId: { in: packageIds }, status: true },
      });

      const salesMap: Record<string, Sale[]> = {};
      sales.forEach((sale) => {
        if (!salesMap[sale.packageId]) salesMap[sale.packageId] = [];
        salesMap[sale.packageId].push(sale);
      });

      return packageIds.map((id) => salesMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const paymentMethodLinksForPackageLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, PaymentMethodLink[]>(
    async (packageIds: string[]) => {
      const links = await parent.prisma.paymentMethodLink.findMany({
        where: { packageId: { in: packageIds } },
      });

      const linksMap: Record<string, PaymentMethodLink[]> = {};
      links.forEach((link) => {
        if (!linksMap[link.packageId]) linksMap[link.packageId] = [];
        linksMap[link.packageId].push(link);
      });

      return packageIds.map((id) => linksMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const freeShareForPackageLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, boolean>(
    async (packageIds: string[]) => {
      const groupSettings = await parent.prisma.groupSetting.findMany({
        select: {
          sponsorBonusPackageId: true,
          rollSponsorBonusPackageId: true,
        },
      });
      const groupSettingMap: Record<string, boolean> = {};
      groupSettings.forEach((groupSetting) => {
        if (groupSetting.sponsorBonusPackageId) {
          groupSettingMap[groupSetting.sponsorBonusPackageId] = true;
        }
        if (groupSetting.rollSponsorBonusPackageId) {
          groupSettingMap[groupSetting.rollSponsorBonusPackageId] = true;
        }
      });

      return packageIds.map((id) => Boolean(groupSettingMap[id]));
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
