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
import { Context } from '@/context';

import { IDsInput, ManySuccessResponse } from '../../graphql/common.type';
import {
  StatisticsResponse,
  StatisticsQueryArgs,
  CreateStatisticsInput,
  UpdateStatisticsInput,
  CreateStatisticsMemberStatisticsInput,
  ConfirmStatistics,
} from './statistics.type';
import { Statistics } from './statistics.entity';
import { MemberStatistics } from '../memberStatistics/memberStatistics.entity';
import { StatisticsSale } from '../statisticsSale/statisticsSale.entity';
import { StatisticsService } from './statistics.service';
import { BlockService } from '../block/block.service';
import { MemberStatisticsService } from '../memberStatistics/memberStatistics.service';
import { StatisticsSaleService } from '../statisticsSale/statisticsSale.service';
import { MemberStatisticsWalletService } from '../memberStatisticsWallet/memberStatisticsWallet.service';
import { MemberService } from '../member/member.service';
import { Transaction } from '@/graphql/decorator';

@Service()
@Resolver(() => Statistics)
export class StatisticsResolver {
  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly memberStatisticsService: MemberStatisticsService,
    private readonly statisticsSaleService: StatisticsSaleService,
    private readonly memberStatisticsWalletService: MemberStatisticsWalletService,
    private readonly blockService: BlockService,
    private readonly memberService: MemberService
  ) {}

  @Authorized()
  @Query(() => StatisticsResponse)
  async statistics(
    @Ctx() ctx: Context,
    @Args() query: StatisticsQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<StatisticsResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; statistics?: Promise<Statistics[]> } = {};

    if (!ctx.isAdmin) {
      query.filter = {
        ...query.filter,
        status: true,
      };
    }

    if ('total' in fields) {
      promises.total = this.statisticsService.getStatisticsCount(query);
    }

    if ('statistics' in fields) {
      promises.statistics = this.statisticsService.getStatistics(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; statistics?: Statistics[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => Statistics)
  async createStatistics(@Arg('data') data: CreateStatisticsInput): Promise<Statistics> {
    const members = await this.memberService.getMembers({
      where: {
        id: {
          in: data.memberStatistics.map((memberstatistic) => memberstatistic.memberId),
        },
        memberWallets: {
          none: {},
        },
      },
      orderBy: [],
      parsePage: {},
    });

    if (members.length) {
      throw new Error(
        `There are members with no wallets - ${members.map((mb) => mb.username).join(',')}`
      );
    }

    if (data.id) {
      this.memberStatisticsService.removeMemberStatisticsByStatisticId({
        id: data.id,
      });
      this.statisticsSaleService.removeStatisticsSalesByStatisticId({
        id: data.id,
      });
    }
    let statistic = data.id
      ? await this.statisticsService.getStatisticsById(data.id)
      : await this.statisticsService.getLastStatistic();
    let { from, to, count } = await this.blockService.getBlockDataRange({
      issuedAt: data.issuedAt,
    });

    const { count: totalBlocks } = await this.blockService.getBlockDataRange({
      issuedAt: {
        lte: data.issuedAt,
      },
    });

    const status = data.status;

    const payload = {
      newBlocks: count,
      totalBlocks,
      totalMembers: data.totalMembers,
      status,
      totalHashPower: data.totalHashPower,
      txcShared: data.txcShared,
      issuedAt: data.issuedAt,
      from: from || data.issuedAt,
      to: to || data.issuedAt,
    };

    statistic = data.id
      ? await this.statisticsService.updateStatisticsWholeById(data.id, payload)
      : await this.statisticsService.createStatistics(payload);

    await this.statisticsSaleService.createManyStatisticsSales({
      statisticsSales: data.saleIds.map((saleId: string) => {
        return {
          statisticsId: statistic.id,
          issuedAt: data.issuedAt,
          saleId,
        };
      }),
    });

    await this.memberStatisticsService.createManyMemberStatistics({
      memberStatistics: data.memberStatistics.map(
        (memberStatistic: CreateStatisticsMemberStatisticsInput) => {
          return {
            hashPower: memberStatistic.hashPower,
            issuedAt: data.issuedAt,
            memberId: memberStatistic.memberId,
            percent: memberStatistic.percent,
            statisticsId: statistic.id,
            txcShared: memberStatistic.txcShared,
          };
        }
      ),
    });

    return statistic;
  }

  @Authorized([UserRole.ADMIN])
  @Mutation(() => Statistics)
  async updateStatistics(@Arg('data') data: UpdateStatisticsInput): Promise<Statistics> {
    return await this.statisticsService.updateStatistics(data);
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => Statistics)
  async confirmStatistics(@Arg('data') data: ConfirmStatistics): Promise<Statistics> {
    if (!data.transactionId) {
      throw new Error('Transaction ID is required');
    }
    const statistic = await this.statisticsService.updateStatistics({
      id: data.id,
      status: true,
      transactionId: data.transactionId,
    });
    await this.memberStatisticsWalletService.createMemberStatisticsWalletByStatistic(statistic);
    return statistic;
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => ManySuccessResponse)
  async removeManyStatistics(@Arg('data') data: IDsInput): Promise<ManySuccessResponse> {
    await this.memberStatisticsService.removeMemberStatisticsByStatisticIds(data);
    await this.statisticsSaleService.removeStatisticsSalesByStatisticIds(data);
    return await this.statisticsService.removeStatisticByIds(data.ids);
  }

  @FieldResolver({ nullable: true })
  async memberStatistics(
    @Root() statistics: Statistics,
    @Ctx() ctx: Context
  ): Promise<MemberStatistics[]> {
    return ctx.dataLoader.get('memberStatisticsForStatisticsLoader').load(statistics.id);
  }

  @FieldResolver({ nullable: true })
  async statisticsSales(
    @Root() statistics: Statistics,
    @Ctx() ctx: Context
  ): Promise<StatisticsSale[]> {
    return ctx.dataLoader.get('statisticsSalesForStatisticsLoader').load(statistics.id);
  }
}
