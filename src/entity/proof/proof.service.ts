import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import {
  CreateProofInput,
  ProofQueryArgs,
  ReferenceInput,
  UpdateProofByIDInput,
  UpdateProofByReferenceInput,
} from './proof.type';
import { FileRelationService } from '../fileRelation/fileRelation.service';
import { ReferenceLinkService } from '../referenceLink/referenceLink.service';

@Service()
export class ProofService {
  constructor(
    private readonly fileRelationService: FileRelationService,
    private readonly referenceLinkService: ReferenceLinkService,
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

  async createProof(data: CreateProofInput) {
    const { fileIds, reflinks, ...restData } = data;
    const proof = await this.prisma.proof.create({
      data: restData,
    });
    if (fileIds) {
      await this.fileRelationService.setFileRelationsByProofId(proof.id, fileIds);
    }
    if (reflinks) {
      await this.referenceLinkService.setReferenceLinksByProofId(proof.id, reflinks);
    }
    return proof;
  }

  async updateProofById(data: UpdateProofByIDInput) {
    const { fileIds, reflinks, ...restData } = data;
    const proof = await this.prisma.proof.update({
      where: {
        id: data.id,
      },
      data: restData,
    });
    if (fileIds) {
      await this.fileRelationService.setFileRelationsByProofId(proof.id, fileIds);
    }
    if (reflinks) {
      await this.referenceLinkService.setReferenceLinksByProofId(proof.id, reflinks);
    }

    return proof;
  }

  async updateProofByReference(data: UpdateProofByReferenceInput) {
    const { fileIds, reflinks, ...restData } = data;
    const proof = await this.prisma.proof.update({
      where: {
        refId_type: {
          refId: data.refId,
          type: data.type,
        },
      },
      data: restData,
    });
    if (fileIds) {
      await this.fileRelationService.setFileRelationsByProofId(proof.id, fileIds);
    }
    if (reflinks) {
      await this.referenceLinkService.setReferenceLinksByProofId(proof.id, reflinks);
    }

    return proof;
  }

  async removeProof(data: IDInput | ReferenceInput) {
    const whereClause = 'id' in data ? { id: data.id } : { refId_type: data };
    const proof = await this.prisma.proof.findUnique({ where: whereClause });

    await this.fileRelationService.removeFileRelationsByProofId(proof.id);
    await this.referenceLinkService.removeReferenceLinksByProofId(proof.id);
    return this.prisma.proof.delete({
      where: {
        id: proof.id,
      },
    });
  }
}
