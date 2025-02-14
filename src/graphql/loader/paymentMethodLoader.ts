import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { PaymentMethodLink } from '@/entity/paymentMethodLink/paymentMethodLink.entity';

export const paymentMethodLinksForPaymentMethodLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, PaymentMethodLink[]>(
    async (paymentMethodIds: string[]) => {
      const links = await parent.prisma.paymentMethodLink.findMany({
        where: { paymentMethodId: { in: paymentMethodIds } },
      });

      const linksMap: Record<string, PaymentMethodLink[]> = {};
      links.forEach((link) => {
        if (!linksMap[link.paymentMethodId]) linksMap[link.paymentMethodId] = [];
        linksMap[link.paymentMethodId].push(link);
      });

      return paymentMethodIds.map((id) => linksMap[id] ?? []);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
