import { Prisma } from '@prisma/client';
import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { StatisticsQueryArgs, UpdateStatisticsInput } from './statistics.type';

@Service()
export class StatisticsService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getStatistics(params: StatisticsQueryArgs) {
    return this.prisma.statistics.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getStatisticsCount(params: StatisticsQueryArgs) {
    return this.prisma.statistics.count({
      where: params.where,
    });
  }

  async getPendingStatistics(params, date: Date) {
    return this.prisma.statistics.findFirst({
      include: {
        memberStatistics: {
          include: {
            member: true,
          },
        },
      },
      where: {
        status: false,
        issuedAt: date,
        ...params.where,
      },
    });
  }

  async getLatestStatistics() {
    // TODO: `to` should be renamed to `endBlockTime`
    return this.prisma.statistics.findFirst({ orderBy: { to: 'desc' } });
  }

  async getLatestNStatistics(limit: number) {
    return this.prisma.statistics.findMany({
      orderBy: {
        issuedAt: 'desc',
      },
      where: {
        status: true,
      },
      take: limit,
    });
  }

  async getStatisticsById(id: string) {
    return this.prisma.statistics.findUnique({ where: { id } });
  }

  async createStatistics(data: Prisma.StatisticsCreateInput) {
    return this.prisma.statistics.create({ data });
  }

  async updateStatistics(data: UpdateStatisticsInput) {
    return this.prisma.statistics.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async updateStatisticsWholeById(id: string, data: Prisma.StatisticsUpdateInput) {
    return this.prisma.statistics.update({
      where: {
        id,
      },
      data,
    });
  }

  async getLastStatistic() {
    return this.prisma.statistics.findFirst({
      orderBy: {
        issuedAt: 'desc',
      },
    });
  }

  async removeStatisticById(id: string) {
    return this.prisma.statistics.delete({
      where: {
        id,
      },
    });
  }

  async removeStatisticByIds(ids: string[]) {
    return this.prisma.statistics.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }
}
