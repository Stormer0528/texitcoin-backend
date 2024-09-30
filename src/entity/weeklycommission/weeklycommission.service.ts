import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { WeeklyCommissionQueryArgs, WeeklyCommissionUpdateInput } from './weeklycommission.type';
import { WeeklyCommission } from './weeklycommission.entity';

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

  async updateWeeklyCommission(data: WeeklyCommissionUpdateInput): Promise<WeeklyCommission> {
    return this.prisma.weeklyCommission.update({
      where: {
        id: data.id,
      },
      data,
    });
  }
}
