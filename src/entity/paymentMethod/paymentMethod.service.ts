import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import {
  CreatePaymentMethodInput,
  PaymentMethodQueryArgs,
  UpdatePaymentMethodInput,
} from './paymentMethod.type';

@Service()
export class PaymentMethodService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getPaymentMethods(params: PaymentMethodQueryArgs) {
    return await this.prisma.paymentMethod.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getPaymentMethodsCount(params: PaymentMethodQueryArgs): Promise<number> {
    return this.prisma.paymentMethod.count({ where: params.where });
  }

  async getPaymentMethodById(id: string) {
    return this.prisma.paymentMethod.findUnique({
      where: {
        id,
      },
    });
  }

  async createPaymentMethod(data: Omit<CreatePaymentMethodInput, 'paymentMethodLinks'>) {
    return await this.prisma.paymentMethod.create({
      data,
    });
  }

  async updatePaymentMethod(data: Omit<UpdatePaymentMethodInput, 'paymentMethodLinks'>) {
    return await this.prisma.paymentMethod.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async removePaymentMethod(data: IDInput) {
    return this.prisma.paymentMethod.delete({
      where: {
        id: data.id,
      },
    });
  }
}
