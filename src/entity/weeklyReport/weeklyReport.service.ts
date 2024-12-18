import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import { WeeklyReportQueryArgs } from './weeklyReport.type';

@Service()
export class WeeklyReportService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getWeeklyReports(params: WeeklyReportQueryArgs) {
    return await this.prisma.weeklyReport.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getWeeklyReportsCount(params: Pick<WeeklyReportQueryArgs, 'where'>): Promise<number> {
    return this.prisma.weeklyReport.count({ where: params.where });
  }
}
