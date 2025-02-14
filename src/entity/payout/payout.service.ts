import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { CreatePayoutInput, PayoutQueryArgs } from './payout.type';

@Service()
export class PayoutService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getPayouts(params: PayoutQueryArgs) {
    return await this.prisma.payout.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getPayoutsCount(params: PayoutQueryArgs): Promise<number> {
    return this.prisma.payout.count({ where: params.where });
  }

  async getPayoutById(id: string) {
    return this.prisma.payout.findUnique({
      where: {
        id,
      },
    });
  }

  async createPayout(data: CreatePayoutInput) {
    return this.prisma.payout.create({
      data,
    });
  }
}
