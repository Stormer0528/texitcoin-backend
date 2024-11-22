import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import {
  CreatePrepaidCommissionInput,
  PrepaidCommissionQueryArgs,
  UpdatePrepaidCommissionInput,
} from './prepaidCommission.type';

@Service()
export class PrepaidCommissionService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getPrepaidCommissions(params: PrepaidCommissionQueryArgs) {
    return await this.prisma.prepaidCommission.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getPrepaidCommissionsCount(params: PrepaidCommissionQueryArgs): Promise<number> {
    return this.prisma.prepaidCommission.count({ where: params.where });
  }

  async getPrepaidCommissionById(id: string) {
    return this.prisma.prepaidCommission.findUnique({
      where: {
        id,
      },
    });
  }

  async createPrepaidCommission(
    data: Omit<CreatePrepaidCommissionInput, 'fileIds' | 'reflinks' | 'note'>
  ) {
    return this.prisma.prepaidCommission.create({
      data,
    });
  }

  async updatePrepaidCommission(
    data: Omit<UpdatePrepaidCommissionInput, 'fileIds' | 'reflinks' | 'note'>
  ) {
    return this.prisma.prepaidCommission.update({
      data,
      where: {
        id: data.id,
      },
    });
  }

  async removePrepaidCommission(data: IDInput) {
    return this.prisma.prepaidCommission.delete({
      where: {
        id: data.id,
      },
    });
  }
}
