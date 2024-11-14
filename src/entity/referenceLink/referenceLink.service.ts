import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';
import { CreateReferenceLinkInput, LinkInput, ReferenceLinkQueryArgs } from './referenceLink.type';

@Service()
export class ReferenceLinkService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getReferenceLinks(params: ReferenceLinkQueryArgs) {
    return this.prisma.referenceLink.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getReferenceLinksCount(params: ReferenceLinkQueryArgs): Promise<number> {
    return this.prisma.referenceLink.count({ where: params.where });
  }

  async createReferenceLinks(data: CreateReferenceLinkInput[]) {
    return this.prisma.referenceLink.createMany({
      data,
    });
  }

  async setReferenceLinksBySaldId(saleId: string, links: LinkInput[]) {
    await this.prisma.referenceLink.deleteMany({
      where: {
        saleId,
      },
    });
    await this.prisma.referenceLink.createMany({
      data: links.map((link) => ({ saleId, ...link })),
    });
  }

  async setReferenceLinksByCommissionId(commissionId: string, links: LinkInput[]) {
    await this.prisma.referenceLink.deleteMany({
      where: {
        commissionId,
      },
    });
    await this.prisma.referenceLink.createMany({
      data: links.map((link) => ({ commissionId, ...link })),
    });
  }

  async setReferenceLinksByPrepaidCommissionId(prepaidCommissionId: string, links: LinkInput[]) {
    await this.prisma.referenceLink.deleteMany({
      where: {
        prepaidCommissionId,
      },
    });
    await this.prisma.referenceLink.createMany({
      data: links.map((link) => ({ prepaidCommissionId, ...link })),
    });
  }

  async removeReferenceLinksBySaleId(saleId: string) {
    return this.prisma.referenceLink.deleteMany({
      where: {
        saleId,
      },
    });
  }

  async removeReferenceLinksByPrepaidCommissionId(prepaidCommissionId: string) {
    return this.prisma.referenceLink.deleteMany({
      where: {
        prepaidCommissionId,
      },
    });
  }
}
