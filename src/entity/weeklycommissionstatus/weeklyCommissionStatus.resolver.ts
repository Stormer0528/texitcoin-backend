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
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { Context } from '@/context';

import { Member } from '../member/member.entity';
import { UserRole } from '@/type';
import { WeeklyCommissionStatus } from './weeklyCommissionStatus.entity';
import { WeeklyCommissionStatusService } from './weeklyCommissionStatus.service';
import {
  WeeklyCommissionStatusQueryArgs,
  WeeklyCommissionStatusResponse,
  WeeklyCommissionStatusUpdateInput,
} from './weeklyCommissionStatus.type';
import { WeeklyCommission } from '../weeklycommission/weeklycommission.entity';

@Service()
@Resolver(() => WeeklyCommissionStatus)
export class WeeklyCommissionStatusResolver {
  constructor(private readonly service: WeeklyCommissionStatusService) {}

  @Authorized([UserRole.Admin])
  @Query(() => WeeklyCommissionStatusResponse)
  async weeklyCommissionStatuses(
    @Args() query: WeeklyCommissionStatusQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<WeeklyCommissionStatusResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; weeklyCommissionStatuses?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getWeeklyCommissionStatusesCount(query);
    }

    if ('weeklyCommissionStatuses' in fields) {
      promises.weeklyCommissionStatuses = this.service.getWeeklyCommissionStatuses(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; weeklyCommissionStatuses?: WeeklyCommissionStatus[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.Admin])
  async updateCommissionStatus(@Arg('data') data: WeeklyCommissionStatusUpdateInput) {
    return this.service.updateWeeklyCommissionStatus(data);
  }

  @FieldResolver({ nullable: true })
  async member(
    @Root() weeklyCommissionStatus: WeeklyCommissionStatus,
    @Ctx() ctx: Context
  ): Promise<Member> {
    return ctx.dataLoader
      .get('memberForWeeklyCommissionStatusLoader')
      .load(weeklyCommissionStatus.memberId);
  }

  @FieldResolver({ nullable: true })
  async weeklyCommission(
    @Root() weeklyCommisionStatus: WeeklyCommissionStatus,
    @Ctx() ctx: Context
  ): Promise<WeeklyCommission> {
    return weeklyCommisionStatus.weeklyCommissionId
      ? ctx.dataLoader
          .get('weeklyCommissionsForWeeklyCommissionStatusLoader')
          .load(weeklyCommisionStatus.weeklyCommissionId)
      : null;
  }
}
