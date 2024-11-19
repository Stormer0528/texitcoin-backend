import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import { CreateProofInput, ProofQueryArgs, UpdateProofInput } from './proof.type';

@Service()
export class ProofService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getProofs(params: ProofQueryArgs) {
    return await this.prisma.proof.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getProofsCount(params: ProofQueryArgs): Promise<number> {
    return this.prisma.proof.count({ where: params.where });
  }

  async getProofById(id: string) {
    return this.prisma.proof.findUnique({
      where: {
        id,
      },
    });
  }

  async createProof(data: Omit<CreateProofInput, 'fileIds'>) {
    return await this.prisma.proof.create({
      data,
    });
  }

  async updateProof(data: Omit<UpdateProofInput, 'fileIds'>) {
    return await this.prisma.proof.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async removeProof(data: IDInput) {
    return this.prisma.proof.delete({
      where: {
        id: data.id,
      },
    });
  }
}
