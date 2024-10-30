import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';
import { CreateFileSaleInput, FileSaleQueryArgs, UpdateFileSaleInput } from './fileSale.type';

@Service()
export class FileSaleService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getFileSales(params: FileSaleQueryArgs) {
    return this.prisma.fileSale.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getFileSalesCount(params: FileSaleQueryArgs): Promise<number> {
    return this.prisma.fileSale.count({ where: params.where });
  }

  async createFileSales(data: CreateFileSaleInput[]) {
    return this.prisma.fileSale.createMany({
      data,
    });
  }

  async setFileSales(saleId: string, fileIds: string[]) {
    await this.prisma.fileSale.deleteMany({
      where: {
        saleId,
      },
    });
    await this.prisma.fileSale.createMany({
      data: fileIds.map((fileId) => ({ saleId, fileId })),
    });
  }

  async removeFileSalesBySaleId(saleId: string) {
    return this.prisma.fileSale.deleteMany({
      where: {
        saleId,
      },
    });
  }
}
