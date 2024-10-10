import { Service, Inject } from 'typedi';
import { WeeklyCommissionStatus } from '@prisma/client';

import { PrismaService } from '@/service/prisma';
import {
  WeeklyCommissionStatusQueryArgs,
  WeeklyCommissionStatusUpdateInput,
} from './weeklyCommissionStatus.type';

@Service()
export class WeeklyCommissionStatusService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getWeeklyCommissionStatuses(params: WeeklyCommissionStatusQueryArgs) {
    return await this.prisma.weeklyCommissionStatus.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getWeeklyCommissionStatusesCount(params: WeeklyCommissionStatusQueryArgs): Promise<number> {
    return this.prisma.weeklyCommissionStatus.count({ where: params.where });
  }

  async updateWeeklyCommissionStatus(
    data: WeeklyCommissionStatusUpdateInput
  ): Promise<WeeklyCommissionStatus> {
    return this.prisma.weeklyCommissionStatus.update({
      where: {
        id: data.id,
      },
      data,
    });
  }
}
