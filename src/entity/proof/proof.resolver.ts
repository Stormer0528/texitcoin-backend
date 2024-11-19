import { Service } from 'typedi';
import { Arg, Args, Resolver, Query, Mutation, Info, Authorized } from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { UserRole } from '@/type';

import { Transaction } from '@/graphql/decorator';
import { IDInput, SuccessResponse } from '@/graphql/common.type';
import { CreateProofInput, ProofQueryArgs, ProofResponse, UpdateProofInput } from './proof.type';
import { Proof } from './proof.entity';
import { ProofService } from './proof.service';
import { SuccessResult } from '@/graphql/enum';
import { FileRelationService } from '../fileRelation/fileRelation.service';

@Service()
@Resolver(() => Proof)
export class ProofResolver {
  constructor(
    private readonly service: ProofService,
    private readonly fileRelationService: FileRelationService
  ) {}

  @Query(() => ProofResponse)
  async proofs(
    @Args() query: ProofQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<ProofResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; proofs?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getProofsCount(query);
    }

    if ('proofs' in fields) {
      promises.proofs = this.service.getProofs(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; proofs?: Proof[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => Proof)
  async createProof(@Arg('data') data: CreateProofInput): Promise<Proof> {
    const { fileIds, ...restData } = data;
    const proof = await this.service.createProof(restData);
    if (fileIds) {
      //
    }
    return proof;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => Proof)
  async updateProof(@Arg('data') data: UpdateProofInput): Promise<Proof> {
    const { fileIds, ...restData } = data;
    if (fileIds) {
      //
    }

    return this.service.updateProof(restData);
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => SuccessResponse)
  async removeProof(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    await this.service.removeProof(data);
    return {
      result: SuccessResult.success,
    };
  }
}
