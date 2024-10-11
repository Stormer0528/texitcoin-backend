import { Inject, Service } from 'typedi';
import { Arg, Resolver, Query, Args, Info, Authorized } from 'type-graphql';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

import { BLOCK_LIMIT, DAILYBLOCK_LIMIT, MONTHLYBLOCK_LIMIT, WEEKLYBLOCK_LIMIT } from '@/consts';
import { QueryOrderPagination } from '@/graphql/queryArgs';

import {
  BlockStatsResponse,
  CommissionOverview,
  CommissionOverviewResponse,
  EntityStats,
} from './general.entity';
import { BlockStatsArgs, LiveStatsArgs } from './general.type';
import { BlockService } from '@/entity/block/block.service';
import { StatisticsService } from '@/entity/statistics/statistics.service';
import { MemberService } from '@/entity/member/member.service';
import { DailyBlockService } from '../dailyblock/dailyblock.service';
import { WeeklyBlockService } from '../weeklyblock/weeklyblock.service';
import { MonthlyBlockService } from '../monthlyblock/monthlyblock.service';
import { GraphQLResolveInfo } from 'graphql';
import { PrismaService } from '@/service/prisma';
import graphqlFields from 'graphql-fields';

@Service()
@Resolver()
export class GeneralResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly statisticsService: StatisticsService,
    private readonly memberService: MemberService,
    private readonly dailyBlockService: DailyBlockService,
    private readonly weeklyBlockService: WeeklyBlockService,
    private readonly monthlyBlockService: MonthlyBlockService,
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}

  @Query(() => EntityStats)
  async liveBlockStats(@Arg('data') { pastDays }: LiveStatsArgs): Promise<EntityStats> {
    const start = dayjs().subtract(pastDays, 'd').startOf('day').toDate();
    const end = dayjs().subtract(1, 'd').endOf('day').toDate();

    const now = new Date();
    const past24Hours = dayjs().subtract(1, 'd').toDate();
    const past48Hours = dayjs().subtract(2, 'd').toDate();

    const [totalBlocks, dailyBlockStats, past24HoursBlocks, past48HoursBlocks] = await Promise.all([
      this.blockService.getBlocksCount({ where: {} }),
      this.blockService.getBlocksCountByDate({
        start,
        end,
      }),
      this.blockService.getBlocksCount({
        where: { createdAt: { gt: past24Hours, lt: now } },
      }),
      this.blockService.getBlocksCount({
        where: { createdAt: { gt: past48Hours, lt: past24Hours } },
      }),
    ]);

    return {
      total: totalBlocks,
      dailyData: dailyBlockStats.map(({ date, count }) => ({
        field: dayjs(date).format('YYYY-MM-DD'),
        count,
      })),
      meta: past24HoursBlocks - past48HoursBlocks,
    };
  }

  @Query(() => EntityStats)
  async liveMiningStats(): Promise<EntityStats> {
    const endOfToday = dayjs().endOf('day').toDate();

    const { to: lastRewardBlockTime } = await this.statisticsService.getLatestStatistics();

    const [totalNewBlocks, dailyNewBlockStats, latestBlock] = await Promise.all([
      this.blockService.getBlocksCount({
        where: { createdAt: { gt: lastRewardBlockTime } },
      }),
      this.blockService.getTimeTookForBlock({
        start: lastRewardBlockTime,
        end: endOfToday,
      }),
      this.blockService.getLatestBlock(),
    ]);

    return {
      total: totalNewBlocks,
      dailyData: dailyNewBlockStats.map(({ blockNo, timeTookInSeconds }) => ({
        field: blockNo.toString(),
        count: timeTookInSeconds || 0,
      })),
      meta: latestBlock.createdAt.valueOf() / 1000,
    };
  }

  @Query(() => EntityStats)
  async liveUserStats(@Arg('data') { pastDays }: LiveStatsArgs): Promise<EntityStats> {
    const start = dayjs().subtract(pastDays, 'd').startOf('day').toDate();
    const end = dayjs().endOf('day').toDate();
    const pastMonth = dayjs().subtract(1, 'M').toDate();

    const [totalMembers, dailyBlockStats, pastMonthUsers] = await Promise.all([
      this.memberService.getMembersCount({ where: {} }),
      this.memberService.getMembersCountByDate({
        start,
        end,
      }),
      this.memberService.getMembersCount({
        where: { createdAt: { gt: pastMonth } },
      }),
    ]);

    return {
      total: totalMembers,
      dailyData: dailyBlockStats.map(({ date, count }) => ({
        field: dayjs(date).format('YYYY-MM-DD'),
        count,
      })),
      meta: pastMonthUsers,
    };
  }

  @Query(() => [BlockStatsResponse])
  async blocksData(@Arg('data') data: BlockStatsArgs): Promise<BlockStatsResponse[]> {
    switch (data.type) {
      case 'day':
        const daydata = await this.dailyBlockService.getDailyBlocks({
          orderBy: {
            issuedAt: 'desc',
          },
          parsePage: {
            skip: 0,
            take: DAILYBLOCK_LIMIT,
          },
          where: {},
        });
        return daydata.map((dt) => ({
          hashRate: dt.hashRate,
          difficulty: dt.difficulty,
          base: dayjs(dt.issuedAt.toISOString().split('T')[0]).format('MM/DD/YYYY'),
        }));
      case 'week':
        const weekdata = await this.weeklyBlockService.getWeeklyBlocks({
          orderBy: {
            issuedAt: 'desc',
          },
          parsePage: {
            skip: 0,
            take: WEEKLYBLOCK_LIMIT,
          },
          where: {},
        });
        return weekdata.map((dt) => {
          const weekNumber = dayjs(dt.issuedAt.toISOString().split('T')[0]).week();
          const month = dayjs(dt.issuedAt.toISOString().split('T')[0]).format('MMM');
          return {
            hashRate: dt.hashRate,
            difficulty: dt.difficulty,
            base: `${month}-${weekNumber}`,
          };
        });
      case 'month':
        const monthdata = await this.monthlyBlockService.getMonthlyBlocks({
          orderBy: {
            issuedAt: 'desc',
          },
          parsePage: {
            skip: 0,
            take: MONTHLYBLOCK_LIMIT,
          },
          where: {},
        });
        return monthdata.map((dt) => ({
          hashRate: dt.hashRate,
          difficulty: dt.difficulty,
          base: dayjs(dt.issuedAt.toISOString().split('T')[0]).format('MM/YYYY'),
        }));
      case 'block':
        const blockdata = await this.blockService.getBlocks({
          orderBy: {
            blockNo: 'desc',
          },
          parsePage: {
            skip: 0,
            take: BLOCK_LIMIT,
          },
          where: {},
        });
        return blockdata.map((dt) => ({
          hashRate: dt.hashRate,
          difficulty: dt.difficulty,
          base: dt.blockNo.toString(),
        }));
      default:
        return [];
    }
  }

  @Authorized()
  @Query(() => CommissionOverviewResponse)
  async commissionsByWeek(
    @Args() query: QueryOrderPagination,
    @Info() info: GraphQLResolveInfo
  ): Promise<CommissionOverviewResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; commissions?: Promise<CommissionOverview[]> } = {};

    if ('total' in fields) {
      promises.total = this.prisma.$queryRaw`
        SELECT 
          COUNT(DISTINCT commission."weekStartDate")::INTEGER AS "totalCount"
        FROM 
          WeeklyCommissionStatuses commission;
      `.then((res) => res[0].totalCount);
    }

    if ('commissions' in fields) {
      promises.commissions = this.prisma.$queryRaw<CommissionOverview[]>`
        SELECT 
          c."weekStartDate" AS "weekStartDate",
          COUNT(s.id)::INTEGER AS "totalSale",
          COUNT(m.id) FILTER (WHERE m."createdAt" < c."weekStartDate" + INTERVAL '7 days')::INTEGER AS "totalMember",
          SUM(COALESCE(wc.commission, 0))::INTEGER AS "totalAmount"
        FROM 
          WeeklyCommissionStatuses c
        LEFT JOIN 
          Sales s ON s."orderedAt" >= c."weekStartDate" AND s."orderedAt" < c."weekStartDate" + INTERVAL '7 days'
        LEFT JOIN
          Members m ON m."createdAt" < c."weekStartDate" + INTERVAL '7 days'
        LEFT JOIN
          WeeklyCommissions wc ON wc.id = c."weeklyCommissionId"
        GROUP BY 
          c."weekStartDate"
        ORDER BY 
          c."weekStartDate" DESC
        LIMIT 
          ${query.parsePage.take}
        OFFSET
          ${query.parsePage.skip};
      `;
      console.log(await promises.commissions);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; commissions?: CommissionOverview[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }
}
