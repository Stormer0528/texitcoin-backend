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
  UseMiddleware,
  Authorized,
  Mutation,
} from 'type-graphql';
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
import { Confirmation4Status } from '@/graphql/enum';

@Service()
@Resolver(() => WeeklyCommission)
export class WeeklyCommissionResolver {
  constructor(private readonly service: WeeklyCommissionService) {}

  // @Authorized()
  // @Query(() => WeeklyCommissionResponse)
  // async weeklyCommissions(
  //   @Ctx() context: Context,
  //   @Args() query: WeeklyCommissionQueryArgs,
  //   @Info() info: GraphQLResolveInfo
  // ): Promise<WeeklyCommissionResponse> {
  //   const { where, ...rest } = query;
  //   const fields = graphqlFields(info);

  //   if (!context.isAdmin) {
  //     query.filter = {
  //       ...query.filter,
  //       memberId: context.user.id,
  //       status: Confirmation4Status.CONFIRM,
  //     };
  //   }

  //   let promises: { total?: Promise<number>; weeklyCommissions?: any } = {};

  //   if ('total' in fields) {
  //     promises.total = this.service.getWeeklyCommissionsCount(query);
  //   }

  //   if ('weeklyCommissions' in fields) {
  //     promises.weeklyCommissions = this.service.getWeeklyCommissions(query);
  //   }

  //   const result = await Promise.all(Object.entries(promises));

  //   let response: { total?: number; weeklyCommissions?: WeeklyCommission[] } = {};

  //   for (let [key, value] of result) {
  //     response[key] = value;
  //   }

  //   return response;
  // }

  // @Authorized([UserRole.Admin])
  // @Mutation(() => WeeklyCommission)
  // async updateCommissionStatus(@Arg('data') data: WeeklyCommissionUpdateInput) {
  //   const prevCommission = await this.service.getWeeklyCommissionById({ id: data.id });
  //   if (data.status === Confirmation4Status.CONFIRM) {
  //     if (prevCommission.status === Confirmation4Status.PENDING) {
  //       return this.service.updateWeeklyCommission(data);
  //     } else {
  //       throw new Error('You can only confirm the pending commissions');
  //     }
  //   } else if (data.status === Confirmation4Status.BLOCK) {
  //     if (prevCommission.status === Confirmation4Status.PENDING) {
  //       return this.service.updateWeeklyCommission(data);
  //     } else {
  //       throw new Error('You can only block the pending commissions');
  //     }
  //   }
  //   return this.service.updateWeeklyCommission(data);
  // }

  // @FieldResolver({ nullable: true })
  // async member(@Root() weeklyCommision: WeeklyCommission, @Ctx() ctx: Context): Promise<Member> {
  //   return ctx.dataLoader.get('memberForWeeklyCommissionLoader').load(weeklyCommision.memberId);
  // }
}
