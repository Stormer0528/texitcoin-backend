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
import { ConfirmationStatus, SuccessResult } from '@/graphql/enum';
import { PFile } from '../file/file.entity';
import { Member } from '../member/member.entity';
import { ReferenceLinkService } from '../referenceLink/referenceLink.service';
import { RefLink } from '../referenceLink/referenceLink.entity';
import { ProofService } from '../proof/proof.service';
import { Proof } from '../proof/proof.entity';
import { convertNumToString } from '@/utils/convertNumToString';
import { WeeklyCommissionService } from '../weeklycommission/weeklycommission.service';
import { WeeklyCommission } from '../weeklycommission/weeklycommission.entity';

dayjs.extend(utcPlugin);

@Service()
@Resolver(() => PrepaidCommission)
export class PrepaidCommissionResolver {
  constructor(
    private readonly service: PrepaidCommissionService,
    private readonly commissionService: WeeklyCommissionService,
    private proofService: ProofService
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

    if ('prepaidCommissions' in fields) {
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
    const { fileIds, reflinks, note, ...restData } = data;
    const curCommission = await this.commissionService.getWeeklyCommissionById({
      id: restData.commissionId,
    });
    if (curCommission.commission === 0) {
      throw new GraphQLError('Commission must be greater than 0', {
        extensions: {
          path: 'commissionId',
        },
      });
    } else if (curCommission.status != 'PREVIEW') {
      throw new GraphQLError('Commission must be fresh', {
        extensions: {
          path: 'commissionId',
        },
      });
    }
    const prepaidCommission = await this.service.createPrepaidCommission(restData);
    const maxCommissionID = await this.commissionService.getMaxCommissionID();
    const commission = await this.commissionService.updateWeeklyCommission({
      id: prepaidCommission.commissionId,
      status: ConfirmationStatus.PAID,
      ID: maxCommissionID + 1,
    });

    await this.proofService.createProof({
      amount: commission.commission,
      refId: prepaidCommission.id,
      type: 'PREPAY',
      fileIds,
      reflinks,
      note,
    });

    return prepaidCommission;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => PrepaidCommission)
  async updatePrepaidCommission(
    @Arg('data') data: UpdatePrepaidCommissionInput
  ): Promise<PrepaidCommission> {
    const { fileIds, reflinks, note, ...restData } = data;
    const curCommission = await this.commissionService.getWeeklyCommissionById({
      id: restData.commissionId,
    });
    if (curCommission.commission === 0) {
      throw new GraphQLError('Commission must be greater than 0', {
        extensions: {
          path: 'commissionId',
        },
      });
    } else if (curCommission.status != 'PREVIEW') {
      throw new GraphQLError('Commission must be fresh', {
        extensions: {
          path: 'commissionId',
        },
      });
    }

    const prepaidCommission = await this.service.updatePrepaidCommission(restData);
    const commission = await this.commissionService.getWeeklyCommissionById({
      id: prepaidCommission.commissionId,
    });

    await this.proofService.updateProofByReference({
      amount: commission.commission,
      fileIds,
      reflinks,
      note,
      refId: prepaidCommission.id,
      type: 'PREPAY',
    });

    return prepaidCommission;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async removePrepaidCommission(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    const prepaidCommission = await this.service.getPrepaidCommissionById(data.id);
    await this.proofService.removeProof({
      refId: prepaidCommission.id,
      type: 'PREPAY',
    });

    await this.service.removePrepaidCommission(data);
    return {
      result: SuccessResult.success,
    };
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async commission(
    @Root() prepaidCommission: PrepaidCommission,
    @Ctx() ctx: Context
  ): Promise<WeeklyCommission> {
    return ctx.dataLoader
      .get('commissionForPrepaidCommissionLoader')
      .load(prepaidCommission.commissionId);
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async proof(@Root() prepaidCommission: PrepaidCommission, @Ctx() ctx: Context): Promise<Proof> {
    return ctx.dataLoader.get('proofForPrepaidCommissionLoader').load(prepaidCommission.id);
  }
}
