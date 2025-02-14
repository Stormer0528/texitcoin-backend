import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';
import dayjs from 'dayjs';

import { IDInput } from '@/graphql/common.type';
import { CreatePromoInput, PromoQueryArgs, UpdatePromoInput } from './promo.type';
import { GraphQLError } from 'graphql';
import { Promo } from './promo.entity';

@Service()
export class PromoService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getPromos(params: PromoQueryArgs) {
    return await this.prisma.promo.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getPromosCount(params: PromoQueryArgs): Promise<number> {
    return this.prisma.promo.count({ where: params.where });
  }

  async getPromoById(id: string) {
    return this.prisma.promo.findUnique({
      where: {
        id,
      },
    });
  }

  async createPromo(data: CreatePromoInput) {
    return this.prisma.promo.create({
      data,
    });
  }

  async updatePromo(data: UpdatePromoInput) {
    return this.prisma.promo.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async removePromo(data: IDInput) {
    return this.prisma.promo.delete({
      where: {
        id: data.id,
      },
    });
  }

  public validatePromoDates({
    startDate,
    endDate,
    status,
  }: Pick<Promo, 'startDate' | 'endDate' | 'status'>) {
    if (dayjs(startDate, { utc: true }).isAfter(dayjs(endDate, { utc: true }), 'day')) {
      throw new GraphQLError('Start date must be before end date', {
        extensions: {
          path: ['startDate', 'endDate'],
        },
      });
    } else if (status && dayjs(endDate, { utc: true }).isBefore(dayjs(), 'day')) {
      throw new GraphQLError('End date must be in the future', {
        extensions: {
          path: ['endDate'],
        },
      });
    }
  }
}
