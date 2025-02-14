import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';
import {
  CreatePaymentMethodLinkInput,
  PaymentMethodLinkInput,
  PaymentMethodLinksQueryArgs,
} from './paymentMethodLink.type';

@Service()
export class PaymentMethodLinkService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getPaymentMethodLinks(params: PaymentMethodLinksQueryArgs) {
    return this.prisma.paymentMethodLink.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getPaymentMethodLinksCount(params: PaymentMethodLinksQueryArgs): Promise<number> {
    return this.prisma.paymentMethodLink.count({ where: params.where });
  }

  async createPaymentMethodLinks(data: CreatePaymentMethodLinkInput[]) {
    return this.prisma.paymentMethodLink.createMany({
      data,
    });
  }

  async setPaymentMethodLinksByPaymentMethodId(
    paymentMethodId: string,
    links: PaymentMethodLinkInput[]
  ) {
    await this.prisma.paymentMethodLink.deleteMany({
      where: {
        paymentMethodId,
      },
    });
    await this.prisma.paymentMethodLink.createMany({
      data: links.map((link) => ({ paymentMethodId, ...link })),
    });
  }

  async removePaymentMethodLinksByPaymentMethodId(paymentMethodId: string) {
    return this.prisma.paymentMethodLink.deleteMany({
      where: {
        paymentMethodId,
      },
    });
  }
}
