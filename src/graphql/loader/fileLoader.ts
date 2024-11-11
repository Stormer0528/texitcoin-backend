import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Sale } from '@/entity/sale/sale.entity';
import { WeeklyCommission } from '@/entity/weeklycommission/weeklycommission.entity';

export const saleForFileLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Sale>(
    async (fileIds: string[]) => {
      const filesWithSale = await parent.prisma.fileSale.findMany({
        where: {
          fileId: {
            in: fileIds,
          },
        },
        select: {
          fileId: true,
          sale: true,
        },
      });

      const salesmap: Record<string, Sale> = {};
      filesWithSale.forEach((file) => {
        salesmap[file.fileId] = file.sale;
      });

      return fileIds.map((id) => salesmap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const commissionsForFileLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, WeeklyCommission>(
    async (fileIds: string[]) => {
      const filesWithCommissions = await parent.prisma.fileCommission.findMany({
        where: {
          fileId: {
            in: fileIds,
          },
        },
        select: {
          fileId: true,
          commission: true,
        },
      });

      const commissionsMap: Record<string, WeeklyCommission> = {};
      filesWithCommissions.forEach((file) => {
        commissionsMap[file.fileId] = file.commission;
      });

      return fileIds.map((id) => commissionsMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
