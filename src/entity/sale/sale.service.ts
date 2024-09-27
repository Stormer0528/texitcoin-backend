import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import { CreateSaleInput, SaleQueryArgs, UpdateSaleInput } from './sale.type';

@Service()
export class SaleService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getSales(params: SaleQueryArgs) {
    return await this.prisma.sale.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getSalesCount(params: SaleQueryArgs): Promise<number> {
    return this.prisma.sale.count({ where: params.where });
  }

  async getSaleById(id: string) {
    return this.prisma.sale.findUnique({
      where: {
        id,
      },
    });
  }

  async createSale(data: CreateSaleInput) {
    let invoiceNo = data.invoiceNo;
    if (data.invoiceNo) {
      const { invoiceNo: maxInvoiceNo } = await this.prisma.sale.findFirst({
        orderBy: { invoiceNo: 'desc' },
      });
      invoiceNo = maxInvoiceNo + 1;
    }
    return this.prisma.sale.create({
      data: {
        invoiceNo,
        ...data,
      },
    });
  }

  async updateSale(data: UpdateSaleInput) {
    return this.prisma.sale.update({
      data,
      where: {
        id: data.id,
      },
    });
  }

  async removeSale(data: IDInput) {
    return this.prisma.sale.delete({
      where: {
        id: data.id,
      },
    });
  }

  async getMemberHashPowerById(data: IDInput) {
    const members = await this.prisma.sale.findMany({
      where: {
        memberId: data.id,
        status: true,
      },
      include: {
        package: true,
      },
    });
    return members.reduce((prev, current) => {
      return prev + current.package.token;
    }, 0);
  }
}
