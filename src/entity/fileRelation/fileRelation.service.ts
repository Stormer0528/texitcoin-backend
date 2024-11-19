import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';
import { CreateFileRelationInput, FileRelationQueryArgs } from './fileRelation.type';

@Service()
export class FileRelationService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getFileRelations(params: FileRelationQueryArgs) {
    return this.prisma.fileRelation.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getFileRelationsCount(params: FileRelationQueryArgs): Promise<number> {
    return this.prisma.fileRelation.count({ where: params.where });
  }

  async createFileRelations(data: CreateFileRelationInput[]) {
    return this.prisma.fileRelation.createMany({
      data,
    });
  }

  async setFileRelationsBySaldId(saleId: string, fileIds: string[]) {
    await this.prisma.fileRelation.deleteMany({
      where: {
        saleId,
      },
    });
    await this.prisma.fileRelation.createMany({
      data: fileIds.map((fileId) => ({ saleId, fileId })),
    });
  }

  async setFileRelationsByCommissionId(commissionId: string, fileIds: string[]) {
    await this.prisma.fileRelation.deleteMany({
      where: {
        commissionId,
      },
    });
    await this.prisma.fileRelation.createMany({
      data: fileIds.map((fileId) => ({ commissionId, fileId })),
    });
  }
  async setFileRelationsByPrepaidCommissionId(prepaidCommissionId: string, fileIds: string[]) {
    await this.prisma.fileRelation.deleteMany({
      where: {
        prepaidCommissionId,
      },
    });
    await this.prisma.fileRelation.createMany({
      data: fileIds.map((fileId) => ({ prepaidCommissionId, fileId })),
    });
  }
  async setFileRelationsByProofId(proofId: string, fileIds: string[]) {
    await this.prisma.fileRelation.deleteMany({
      where: {
        proofId,
      },
    });
    await this.prisma.fileRelation.createMany({
      data: fileIds.map((fileId) => ({ proofId, fileId })),
    });
  }

  async removeFileRelationsBySaleId(saleId: string) {
    return this.prisma.fileRelation.deleteMany({
      where: {
        saleId,
      },
    });
  }

  async removeFileRelationsByPrepaidCommissionId(prepaidCommissionId: string) {
    return this.prisma.fileRelation.deleteMany({
      where: {
        prepaidCommissionId,
      },
    });
  }

  async removeFileRelationsByProofId(proofId: string) {
    return this.prisma.fileRelation.deleteMany({
      where: {
        proofId,
      },
    });
  }
}
