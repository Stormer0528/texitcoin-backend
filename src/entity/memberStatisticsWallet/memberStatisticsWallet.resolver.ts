import { Service } from 'typedi';
import { Args, Resolver, Query, Info, Authorized, FieldResolver, Root, Ctx } from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { Context } from '@/context';

import { MemberStatisticsWallet } from './memberStatisticsWallet.entity';
import {
  DailyRewards,
  FromToQueryArgs,
  MemberStatisticsWalletQueryArgs,
  MemberStatisticsWalletResponse,
  RewardsByWallets,
} from './memberStatisticsWallet.type';
import { MemberStatistics } from '../memberStatistics/memberStatistics.entity';
import { MemberWallet } from '../memberWallet/memberWallet.entity';
import { MemberStatisticsWalletService } from './memberStatisticsWallet.service';

@Service()
@Resolver(() => MemberStatisticsWallet)
export class MemberStatisticsWalletResolver {
  constructor(private readonly service: MemberStatisticsWalletService) {}

  @Authorized()
  @Query(() => MemberStatisticsWalletResponse)
  async memberStatisticsWallets(
    @Ctx() ctx: Context,
    @Args() query: MemberStatisticsWalletQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<MemberStatisticsWalletResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; memberStatisticsWallets?: any } = {};

    if (!ctx.isAdmin) {
      query.filter = {
        ...query.filter,
        memberWallet: {
          ...query.filter?.memberWallet,
          memberId: ctx.user.id,
        },
      };
    }

    if ('total' in fields) {
      promises.total = this.service.getMemberStatisticsWalletCount(query);
    }

    if ('memberStatisticsWallets' in fields) {
      promises.memberStatisticsWallets = this.service.getMemberStatisticsWallets(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; memberStatisticsWallets?: MemberStatisticsWallet[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized()
  @Query(() => RewardsByWallets)
  async rewardsByWallets(
    @Ctx() ctx: Context,
    @Args() query: FromToQueryArgs
  ): Promise<RewardsByWallets> {
    return {
      rewards: await this.service.getRewardsByWallets({
        ...query,
        memberId: query.memberId ?? ctx.user.id,
      }),
    };
  }

  @Authorized()
  @Query(() => DailyRewards)
  async dailyRewards(@Ctx() ctx: Context, @Args() query: FromToQueryArgs): Promise<DailyRewards> {
    const dailyRewards = await this.service.getDailyRewards({
      ...query,
      memberId: query.memberId ?? ctx.user.id,
    });
    return {
      rewards: dailyRewards.map((reward) => ({
        day: reward.issuedAt,
        totalTxc: reward.txcShared,
        rewardsByWallet: reward.memberStatisticsWallets.map((memberStatistic) => ({
          txc: memberStatistic.txc,
          wallet: memberStatistic.memberWallet,
        })),
      })),
    };
  }

  @FieldResolver({ nullable: true })
  async memberStatistic(
    @Root() member: MemberStatisticsWallet,
    @Ctx() ctx: Context
  ): Promise<MemberStatistics> {
    return ctx.dataLoader
      .get('memberStatisticForMemberStatisticsWalletLoader')
      .load(member.memberStatisticId);
  }

  @FieldResolver({ nullable: true })
  async memberWallet(
    @Root() memberStatisticsWallet: MemberStatisticsWallet,
    @Ctx() ctx: Context
  ): Promise<MemberWallet> {
    return ctx.dataLoader
      .get('memberWalletForMemberStatisticsWalletLoader')
      .load(memberStatisticsWallet.memberWalletId);
  }
}
