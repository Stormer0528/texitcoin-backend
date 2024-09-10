import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';
import { MonthlyBlockQueryArgs } from './monthlyblock.type';

@Service()
export class MonthlyBlockService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getMonthlyBlocks(params: MonthlyBlockQueryArgs) {
    return this.prisma.monthlyBlock.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getMonthlyBlocksCount(params: Pick<MonthlyBlockQueryArgs, 'where'>): Promise<number> {
    return this.prisma.monthlyBlock.count({ where: params.where });
  }
}
