import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Sale } from '@/entity/sale/sale.entity';

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
