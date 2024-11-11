import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';
import { CreateFileCommissionInput, FileCommissionQueryArgs } from './fileCommission.type';

@Service()
export class FileCommissionService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getFileCommissions(params: FileCommissionQueryArgs) {
    return this.prisma.fileCommission.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getFileCommissionsCount(params: FileCommissionQueryArgs): Promise<number> {
    return this.prisma.fileCommission.count({ where: params.where });
  }

  async createFileCommissions(data: CreateFileCommissionInput[]) {
    return this.prisma.fileCommission.createMany({
      data,
    });
  }

  async setFileCommissions(commissionId: string, fileIds: string[]) {
    await this.prisma.fileCommission.deleteMany({
      where: {
        commissionId,
      },
    });
    await this.prisma.fileCommission.createMany({
      data: fileIds.map((fileId) => ({ commissionId, fileId })),
    });
  }

  async removeFileCommissionsBySaleId(commissionId: string) {
    return this.prisma.fileCommission.deleteMany({
      where: {
        commissionId,
      },
    });
  }
}
