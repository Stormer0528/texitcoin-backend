import _ from 'lodash';
import { Service } from 'typedi';
import {
  Arg,
  Args,
  Resolver,
  Query,
  Info,
  FieldResolver,
  Root,
  Ctx,
  Authorized,
  Mutation,
} from 'type-graphql';
import shelljs from 'shelljs';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { Context } from '@/context';

import {
  WeeklyCommissionQueryArgs,
  WeeklyCommissionResponse,
  WeeklyCommissionUpdateInput,
} from './weeklycommission.type';
import { WeeklyCommissionService } from './weeklycommission.service';
import { WeeklyCommission } from './weeklycommission.entity';
import { Member } from '../member/member.entity';
import { UserRole } from '@/type';
import { ConfirmationStatus, SuccessResult } from '@/graphql/enum';
import { PFile } from '../file/file.entity';
import { Transaction } from '@/graphql/decorator';
import { FileRelationService } from '../fileRelation/fileRelation.service';
import { SuccessResponse } from '@/graphql/common.type';
import { COMMISSION_PREVIEW_COMMAND } from '@/consts';
import { ReferenceLinkService } from '../referenceLink/referenceLink.service';
import { RefLink } from '../referenceLink/referenceLink.entity';
import { ProofService } from '../proof/proof.service';
import { Proof } from '../proof/proof.entity';
import { convertNumToString } from '@/utils/convertNumToString';

@Service()
@Resolver(() => WeeklyCommission)
export class WeeklyCommissionResolver {
  constructor(
    private readonly proofService: ProofService,
    private readonly service: WeeklyCommissionService,
    private readonly referenceLinkService: ReferenceLinkService
  ) {}

  @Authorized()
  @Query(() => WeeklyCommissionResponse)
  async weeklyCommissions(
    @Ctx() context: Context,
    @Args() query: WeeklyCommissionQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<WeeklyCommissionResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    if (!context.isAdmin) {
      query.filter = {
        ...query.filter,
        memberId: context.user.id,
        status: {
          in: [ConfirmationStatus.PAID, ConfirmationStatus.APPROVED, ConfirmationStatus.DECLINED],
        },
      };
    }

    let promises: { total?: Promise<number>; weeklyCommissions?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getWeeklyCommissionsCount(query);
    }

    if ('weeklyCommissions' in fields) {
      promises.weeklyCommissions = this.service.getWeeklyCommissions(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; weeklyCommissions?: WeeklyCommission[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => WeeklyCommission)
  async updateCommissionStatus(@Arg('data') data: WeeklyCommissionUpdateInput) {
    const { fileIds, note, reflinks, ...restData } = data;
    const prevCommission = await this.service.getWeeklyCommissionById({ id: data.id });
    if (
      data.status &&
      prevCommission.status !== ConfirmationStatus.PREVIEW &&
      (prevCommission.status === ConfirmationStatus.NONE ||
        !(
          prevCommission.status === ConfirmationStatus.PENDING ||
          (prevCommission.status === ConfirmationStatus.APPROVED &&
            (data.status === ConfirmationStatus.DECLINED ||
              data.status === ConfirmationStatus.PAID)) ||
          (prevCommission.status === ConfirmationStatus.DECLINED &&
            data.status === ConfirmationStatus.APPROVED)
        ))
    ) {
      throw new Error('You can not change status of the commission');
    }

    const updatedCommission = await this.service.updateWeeklyCommission(restData);
    await this.proofService.updateProofByReference({
      refId: convertNumToString({ value: updatedCommission.ID, length: 7, prefix: 'C' }),
      type: 'COMMISSION',
      fileIds,
      note,
      reflinks,
    });

    return updatedCommission;
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => SuccessResponse)
  async calculatePreview(): Promise<SuccessResponse> {
    const { stderr } = shelljs.exec(COMMISSION_PREVIEW_COMMAND);
    return {
      result: stderr ? SuccessResult.failed : SuccessResult.success,
      message: stderr,
    };
  }

  @FieldResolver({ nullable: true })
  async member(@Root() weeklyCommision: WeeklyCommission, @Ctx() ctx: Context): Promise<Member> {
    return ctx.dataLoader.get('memberForWeeklyCommissionLoader').load(weeklyCommision.memberId);
  }

  @Authorized([UserRole.Admin])
  @FieldResolver({ nullable: true })
  async proof(@Root() commission: WeeklyCommission, @Ctx() ctx: Context): Promise<Proof> {
    return commission.ID > 0
      ? ctx.dataLoader
          .get('proofForWeeklyCommissionLoader')
          .load(convertNumToString({ value: commission.ID, length: 7, prefix: 'C' }))
      : null;
  }
}
