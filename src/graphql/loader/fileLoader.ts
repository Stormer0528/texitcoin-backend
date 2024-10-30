import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Sale } from '@/entity/sale/sale.entity';

export const salesForFileLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Sale[]>(
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

      const salesmap: Record<string, Sale[]> = {};
      filesWithSale.forEach((file) => {
        if (!salesmap[file.fileId]) {
          salesmap[file.fileId] = [];
        }
        salesmap[file.fileId].push(file.sale);
      });

      return fileIds.map((id) => salesmap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
