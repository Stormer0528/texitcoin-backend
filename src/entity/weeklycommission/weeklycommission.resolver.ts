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
import { GraphQLError, GraphQLResolveInfo } from 'graphql';

import { Context } from '@/context';

import {
  WeeklyCommissionGetInput,
  WeeklyCommissionNoteInput,
  WeeklyCommissionQueryArgs,
  WeeklyCommissionResponse,
  WeeklyCommissionsStatusUpdateInput,
  WeeklyCommissionUpdateInput,
  WeeklyCommissionWithTeamReportQueryArgs,
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
import { MemberService } from '../member/member.service';
import Bluebird from 'bluebird';

@Service()
@Resolver(() => WeeklyCommission)
export class WeeklyCommissionResolver {
  constructor(
    private readonly proofService: ProofService,
    private readonly service: WeeklyCommissionService,
    private readonly memberService: MemberService
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

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => WeeklyCommission)
  async updateCommission(@Arg('data') data: WeeklyCommissionUpdateInput) {
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
      amount: updatedCommission.commission,
    });

    return updatedCommission;
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async updateCommissionsStatus(
    @Arg('data') data: WeeklyCommissionsStatusUpdateInput
  ): Promise<SuccessResponse> {
    const prevCommissions = await this.service.getWeeklyCommissions({
      where: {
        id: {
          in: data.ids,
        },
      },
      orderBy: {},
      parsePage: {},
    });
    prevCommissions.forEach((prevCommission) => {
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
    });

    await this.service.updateWeeklyCommissionsStatus(data);
    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.ADMIN])
  @Mutation(() => WeeklyCommission)
  async updateCommissionShortNote(@Arg('data') data: WeeklyCommissionNoteInput) {
    return this.service.updateWeeklyCommission(data);
  }

  @Authorized([UserRole.ADMIN])
  @Mutation(() => SuccessResponse)
  async calculatePreview(): Promise<SuccessResponse> {
    const { stderr } = shelljs.exec(COMMISSION_PREVIEW_COMMAND);

    return {
      result: stderr ? SuccessResult.failed : SuccessResult.success,
      message: stderr
        ? (stderr as string)
            .split('\n')
            .find((err) => err.startsWith('Error: '))
            .slice(7) ?? 'Error occurred in commission calculation'
        : '',
    };
  }

  @Authorized([UserRole.MEMBER])
  @Query(() => WeeklyCommissionResponse)
  async teamCommissions(
    @Ctx() context: Context,
    @Args() query: WeeklyCommissionWithTeamReportQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<WeeklyCommissionResponse> {
    const { where, teamReport, ...rest } = query;
    const fields = graphqlFields(info);

    const member = await this.memberService.getMemberById(context.user.id);

    if (
      member.teamReport === 'NONE' ||
      ((teamReport === 'LEFT' || teamReport === 'RIGHT') &&
        !(member.teamReport === 'ALL' || member.teamReport === teamReport))
    ) {
      throw new GraphQLError('You do not have permission to view this team report', {
        extensions: {
          path: ['teamReport'],
        },
      });
    }

    const targetTeamDirection = teamReport === 'REFERRAL' ? member.teamReport : teamReport;
    const placementChildren = await this.memberService.getPlacementChildren(member.id);

    const getTeamMembers = async (position: string) => {
      return Bluebird.map(
        placementChildren.filter((mb) => mb.placementPosition === position),
        async ({ id }) => {
          return await this.memberService.getAllPlacementAncestorsById(id);
        },
        { concurrency: 5 }
      ).then((result) => result.flat());
    };

    let teamReportMembers = [];
    if (targetTeamDirection === 'LEFT' || targetTeamDirection === 'ALL') {
      teamReportMembers.push(...(await getTeamMembers('LEFT')));
    }

    if (targetTeamDirection === 'RIGHT' || targetTeamDirection === 'ALL') {
      teamReportMembers.push(...(await getTeamMembers('RIGHT')));
    }

    if (teamReport === 'REFERRAL') {
      const introducers = await this.memberService.getIntroducers(context.user.id);
      teamReportMembers = teamReportMembers.filter((mb) =>
        introducers.some(({ id }) => id === mb.id)
      );
    }

    query.filter = {
      ...query.filter,
      memberId: {
        in: [...teamReportMembers.map(({ id }) => id)],
      },
      status: ConfirmationStatus.PREVIEW,
    };

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

  @Authorized([UserRole.ADMIN])
  @Query(() => WeeklyCommission)
  async commissionByMemberIDAndWeek(
    @Arg('data') data: WeeklyCommissionGetInput
  ): Promise<WeeklyCommission> {
    return this.service.getWeeklyCommissionByMemberIdAndDate(data);
  }

  @FieldResolver({ nullable: true })
  async member(@Root() weeklyCommision: WeeklyCommission, @Ctx() ctx: Context): Promise<Member> {
    return ctx.dataLoader.get('memberForWeeklyCommissionLoader').load(weeklyCommision.memberId);
  }

  @Authorized([UserRole.ADMIN])
  @FieldResolver({ nullable: true })
  async proof(@Root() commission: WeeklyCommission, @Ctx() ctx: Context): Promise<Proof> {
    return commission.ID > 0
      ? ctx.dataLoader
          .get('proofForWeeklyCommissionLoader')
          .load(convertNumToString({ value: commission.ID, length: 7, prefix: 'C' }))
      : null;
  }
}
