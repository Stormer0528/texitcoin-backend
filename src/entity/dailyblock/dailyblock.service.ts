import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';
import { DailyBlockQueryArgs } from './dailyblock.type';

@Service()
export class DailyBlockService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getDailyBlocks(params: DailyBlockQueryArgs) {
    return this.prisma.dailyBlock.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getDailyBlocksCount(params: Pick<DailyBlockQueryArgs, 'where'>): Promise<number> {
    return this.prisma.dailyBlock.count({ where: params.where });
  }
}
