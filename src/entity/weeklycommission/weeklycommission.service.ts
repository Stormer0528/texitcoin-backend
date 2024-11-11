import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';

import { WeeklyCommissionQueryArgs, WeeklyCommissionUpdateInput } from './weeklycommission.type';
import { WeeklyCommission } from './weeklycommission.entity';
import { FileCommissionService } from '../fileCommission/fileCommission.service';

@Service()
export class WeeklyCommissionService {
  constructor(
    private readonly fileCommissionService: FileCommissionService,
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

  async getWeeklyCommissionById(data: IDInput): Promise<WeeklyCommission> {
    return this.prisma.weeklyCommission.findUnique({
      where: {
        id: data.id,
      },
    });
  }

  async updateWeeklyCommission(
    data: Omit<WeeklyCommissionUpdateInput, 'fileIds'>
  ): Promise<WeeklyCommission> {
    return this.prisma.weeklyCommission.update({
      where: {
        id: data.id,
      },
      data,
    });
  }
}
