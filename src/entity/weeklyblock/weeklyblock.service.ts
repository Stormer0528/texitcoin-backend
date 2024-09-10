import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';
import { WeeklyBlockQueryArgs } from './weeklyblock.type';

@Service()
export class WeeklyBlockService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getWeeklyBlocks(params: WeeklyBlockQueryArgs) {
    return this.prisma.weeklyBlock.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getWeeklyBlocksCount(params: Pick<WeeklyBlockQueryArgs, 'where'>): Promise<number> {
    return this.prisma.weeklyBlock.count({ where: params.where });
  }
}
