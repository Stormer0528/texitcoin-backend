import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { WeeklyCommissionQueryArgs } from './weeklycommission.type';

@Service()
export class WeeklyCommissionService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getWeeklyCommissions(params: WeeklyCommissionQueryArgs) {
    return await this.prisma.weeklyCommission.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getWeeklyCommissionsCount(params: WeeklyCommissionQueryArgs): Promise<number> {
    return this.prisma.weeklyCommission.count({ where: params.where });
  }
}
