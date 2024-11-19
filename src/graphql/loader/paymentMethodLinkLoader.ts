import DataLoader from 'dataloader';

import RootDataLoader from '.';
import { Package } from '@/entity/package/package.entity';
import { PaymentMethod } from '@/entity/paymentMethod/paymentMethod.entity';

export const paymentMethodForPaymentMethodLinkLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, PaymentMethod>(
    async (paymentMethodIds: string[]) => {
      const paymentMethods = await parent.prisma.paymentMethod.findMany({
        where: { id: { in: paymentMethodIds } },
      });

      const paymentMap: Record<string, PaymentMethod> = {};
      paymentMethods.forEach((payment) => {
        paymentMap[payment.id] = payment;
      });

      return paymentMethodIds.map((id) => paymentMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};

export const packageForPaymentMethodLinkLoader = (parent: RootDataLoader) => {
  return new DataLoader<string, Package>(
    async (packageIds: string[]) => {
      const packages = await parent.prisma.package.findMany({
        where: { id: { in: packageIds } },
      });

      const packageMap: Record<string, Package> = {};
      packages.forEach((pkg) => {
        packageMap[pkg.id] = pkg;
      });

      return packageIds.map((id) => packageMap[id]);
    },
    {
      ...parent.dataLoaderOptions,
    }
  );
};
