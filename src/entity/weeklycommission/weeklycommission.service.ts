import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';

import {
  WeeklyCommissionGetInput,
  WeeklyCommissionQueryArgs,
  WeeklyCommissionUpdateInput,
} from './weeklycommission.type';
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

  async getWeeklyCommissionById(data: IDInput): Promise<WeeklyCommission> {
    return this.prisma.weeklyCommission.findUnique({
      where: {
        id: data.id,
      },
    });
  }

  async getMaxCommissionID(): Promise<number> {
    const commission = await this.prisma.weeklyCommission.findFirst({
      orderBy: {
        ID: 'desc',
      },
      select: {
        ID: true,
      },
    });
    return commission?.ID || 0;
  }

  async getWeeklyCommissionByMemberIdAndDate(
    data: WeeklyCommissionGetInput
  ): Promise<WeeklyCommission> {
    return this.prisma.weeklyCommission.findUnique({
      where: {
        memberId_weekStartDate: data,
      },
    });
  }

  async getWeeklyCommissionsByMemberId(memberId: string): Promise<WeeklyCommission[]> {
    return this.prisma.weeklyCommission.findMany({
      where: {
        memberId,
        status: {
          not: 'PREVIEW',
        },
      },
    });
  }

  async getWeeklyCommissionsCountByMemberId(memberId: string): Promise<number> {
    return this.prisma.weeklyCommission.count({
      where: {
        memberId,
        status: {
          not: 'PREVIEW',
        },
      },
    });
  }

  async updateWeeklyCommission(
    data: Omit<WeeklyCommissionUpdateInput, 'fileIds' | 'reflinks' | 'note'> & { ID?: number }
  ): Promise<WeeklyCommission> {
    return this.prisma.weeklyCommission.update({
      where: {
        id: data.id,
      },
      data,
    });
  }
}
