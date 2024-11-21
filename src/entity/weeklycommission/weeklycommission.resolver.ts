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

@Service()
@Resolver(() => WeeklyCommission)
export class WeeklyCommissionResolver {
  constructor(
    private readonly fileRelationService: FileRelationService,
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
    const prevCommission = await this.service.getWeeklyCommissionById({ id: data.id });
    if (
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

    if (data?.fileIds) {
      await this.fileRelationService.setFileRelationsByCommissionId(data.id, data.fileIds);
    }

    if (data?.reflinks) {
      await this.referenceLinkService.setReferenceLinksByCommissionId(data.id, data.reflinks);
    }

    return this.service.updateWeeklyCommission(_.omit(data, 'fileIds', 'reflinks'));
  }

  @Mutation(() => SuccessResponse)
  async calculatePreview(): Promise<SuccessResponse> {
    shelljs.exec(COMMISSION_PREVIEW_COMMAND);
    return {
      result: SuccessResult.success,
    };
  }

  @FieldResolver({ nullable: true })
  async member(@Root() weeklyCommision: WeeklyCommission, @Ctx() ctx: Context): Promise<Member> {
    return ctx.dataLoader.get('memberForWeeklyCommissionLoader').load(weeklyCommision.memberId);
  }

  @Authorized([UserRole.Admin])
  @FieldResolver({ nullable: 'itemsAndList' })
  async paymentConfirm(
    @Root() commission: WeeklyCommission,
    @Ctx() ctx: Context
  ): Promise<PFile[]> {
    return ctx.dataLoader.get('filesForWeeklyCommissionLoader').load(commission.id);
  }

  @Authorized([UserRole.Admin])
  @FieldResolver({ nullable: 'itemsAndList' })
  async reflinks(@Root() commission: WeeklyCommission, @Ctx() ctx: Context): Promise<RefLink[]> {
    return ctx.dataLoader.get('referenceLinksForCommissionLoader').load(commission.id);
  }
}
