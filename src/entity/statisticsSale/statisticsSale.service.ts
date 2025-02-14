import { Prisma } from '@prisma/client';
import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput, IDsInput } from '../../graphql/common.type';
import {
  CreateManyStatisticsSaleInput,
  CreateStatisticsSaleInput,
  StatisticsSaleQueryArgs,
} from './statisticsSale.type';

@Service()
export class StatisticsSaleService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getStatisticsSales(params: StatisticsSaleQueryArgs) {
    return this.prisma.statisticsSale.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getStatisticsSaleCount(params: StatisticsSaleQueryArgs): Promise<number> {
    return this.prisma.statisticsSale.count({ where: params.where });
  }

  async getMemberStatisticsById(id: string) {
    return this.prisma.memberStatistics.findUnique({
      where: {
        id,
      },
    });
  }

  async createStatisticsSale(data: CreateStatisticsSaleInput) {
    return this.prisma.statisticsSale.create({
      data,
    });
  }

  async createManyStatisticsSales(data: CreateManyStatisticsSaleInput) {
    return this.prisma.statisticsSale.createMany({
      data: data.statisticsSales,
    });
  }

  async removeManyStatisticsSales(data: IDsInput) {
    return this.prisma.statisticsSale.deleteMany({
      where: {
        id: {
          in: data.ids,
        },
      },
    });
  }

  async removeStatisticsSalesByStatisticId(data: IDInput) {
    return this.prisma.statisticsSale.deleteMany({
      where: {
        statisticsId: data.id,
      },
    });
  }

  async removeStatisticsSalesByStatisticIds(data: IDsInput) {
    return this.prisma.statisticsSale.deleteMany({
      where: {
        statisticsId: {
          in: data.ids,
        },
      },
    });
  }

  async getTotalTXCShared(memberId: string) {
    const { _sum: data } = await this.prisma.memberStatistics.aggregate({
      _sum: {
        txcShared: true,
      },
      where: {
        memberId,
      },
    });

    return data;
  }

  async getMemberStatistic(query: Prisma.MemberStatisticsFindFirstArgs) {
    return this.prisma.memberStatistics.findFirst(query);
  }
}
