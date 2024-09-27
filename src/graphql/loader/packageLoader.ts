import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Sale } from '@/entity/sale/sale.entity';

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
