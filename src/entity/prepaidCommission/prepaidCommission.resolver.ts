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
  Ctx,
  Root,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import _ from 'lodash';

import { UserRole } from '@/type';
import { Context } from '@/context';

import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';
import { PrepaidCommission } from './prepaidCommission.entity';
import { PrepaidCommissionService } from './prepaidCommission.service';
import {
  CreatePrepaidCommissionInput,
  PrepaidCommissionQueryArgs,
  PrepaidCommissionResponse,
  UpdatePrepaidCommissionInput,
} from './prepaidCommission.type';
import { Transaction } from '@/graphql/decorator';
import { MemberService } from '../member/member.service';
import { FileRelationService } from '../fileRelation/fileRelation.service';
import { IDInput, SuccessResponse } from '@/graphql/common.type';
import { SuccessResult } from '@/graphql/enum';
import { Sale } from '../sale/sale.entity';
import { PFile } from '../file/file.entity';
import { Member } from '../member/member.entity';

dayjs.extend(utcPlugin);

@Service()
@Resolver(() => PrepaidCommission)
export class PrepaidCommissionResolver {
  constructor(
    private readonly service: PrepaidCommissionService,
    private memberService: MemberService,
    private readonly fileRelationService: FileRelationService
  ) {}

  @Authorized([UserRole.Admin])
  @Query(() => PrepaidCommissionResponse)
  async prepaidCommissions(
    @Ctx() ctx: Context,
    @Args() query: PrepaidCommissionQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<PrepaidCommissionResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; prepaidCommissions?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getPrepaidCommissionsCount(query);
    }

    if ('sales' in fields) {
      promises.prepaidCommissions = this.service.getPrepaidCommissions(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; prepaidCommissions?: PrepaidCommission[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => PrepaidCommission)
  async createPrepaidCommission(
    @Arg('data') data: CreatePrepaidCommissionInput
  ): Promise<PrepaidCommission> {
    const { emailVerified, status } = await this.memberService.getMemberById(data.memberId);
    if (!emailVerified) {
      throw new GraphQLError('This member did not verify the email', {
        extensions: {
          path: ['memberId'],
        },
      });
    }
    if (!status) {
      throw new GraphQLError('This member is not allowed', {
        extensions: {
          path: ['memberId'],
        },
      });
    }

    const { fileIds, ...restData } = data;
    const prepaidCommission = await this.service.createPrepaidCommission(restData);
    if (fileIds) {
      await this.fileRelationService.createFileRelations(
        fileIds.map((fileId) => ({ prepaidCommissionId: prepaidCommission.id, fileId }))
      );
    }
    return prepaidCommission;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => PrepaidCommission)
  async updatePrepaidCommission(
    @Arg('data') data: UpdatePrepaidCommissionInput
  ): Promise<PrepaidCommission> {
    const { fileIds, ...restData } = data;
    const prepaidCommission = await this.service.updatePrepaidCommission(restData);
    if (fileIds) {
      await this.fileRelationService.setFileRelationsBySaldId(prepaidCommission.id, fileIds);
    }
    return prepaidCommission;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async removePrepaidCommission(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    const prepaidCommission = await this.service.getPrepaidCommissionById(data.id);
    await this.fileRelationService.removeFileRelationsByPrepaidCommissionId(prepaidCommission.id);
    await this.service.removePrepaidCommission(data);
    return {
      result: SuccessResult.success,
    };
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async member(@Root() prepaidCommission: PrepaidCommission, @Ctx() ctx: Context): Promise<Member> {
    return ctx.dataLoader.get('memberForPrepaidCommissionLoader').load(prepaidCommission.memberId);
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async paymentConfirm(
    @Root() prepaidCommission: PrepaidCommission,
    @Ctx() ctx: Context
  ): Promise<PFile[]> {
    return ctx.dataLoader.get('filesForPrepaidCommissionLoader').load(prepaidCommission.id);
  }
}
