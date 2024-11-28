import { Service } from 'typedi';
import {
  Arg,
  Args,
  Resolver,
  Query,
  Mutation,
  Info,
  Authorized,
  FieldResolver,
  Root,
  Ctx,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { UserRole } from '@/type';

import { Transaction } from '@/graphql/decorator';
import { IDInput, SuccessResponse } from '@/graphql/common.type';
import {
  CreateProofInput,
  ProofQueryArgs,
  ProofResponse,
  UpdateProofByIDInput,
} from './proof.type';
import { Proof } from './proof.entity';
import { ProofService } from './proof.service';
import { SuccessResult } from '@/graphql/enum';
import { FileRelationService } from '../fileRelation/fileRelation.service';
import { Context } from '@/context';
import { PFile } from '../file/file.entity';
import { RefLink } from '../referenceLink/referenceLink.entity';

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
    return this.service.createProof(data);
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => Proof)
  async updateProof(@Arg('data') data: UpdateProofByIDInput): Promise<Proof> {
    return this.service.updateProofById(data);
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => SuccessResponse)
  async removeProof(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    await this.service.removeProof(data);
    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.Admin])
  @FieldResolver({ nullable: true })
  async files(@Root() proof: Proof, @Ctx() ctx: Context): Promise<PFile[]> {
    return ctx.dataLoader.get('filesForProofLoader').load(proof.id);
  }

  @Authorized([UserRole.Admin])
  @FieldResolver({ nullable: true })
  async reflinks(@Root() proof: Proof, @Ctx() ctx: Context): Promise<RefLink[]> {
    return ctx.dataLoader.get('referenceLinksForProofLoader').load(proof.id);
  }
}
