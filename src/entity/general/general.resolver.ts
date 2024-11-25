import { Inject, Service } from 'typedi';
import { Arg, Resolver, Query, Args, Info, Authorized } from 'type-graphql';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear';

dayjs.extend(weekOfYear);

import {
  BLOCK_LIMIT,
  DAILY_BLOCK_LIMIT,
  DAILY_MINER_LIMIT,
  DAILY_MINER_REWARD_LIMIT,
  MONTHLY_BLOCK_LIMIT,
  MONTHLY_COMMISSION_LIMIT,
  MONTHLY_MINER_LIMIT,
  MONTHLY_MINER_REWARD_LIMIT,
  QUATER_COMMISSION_LIMIT,
  QUATER_MINER_LIMIT,
  QUATER_MINER_REWARD_LIMIT,
  WEEKLY_BLOCK_LIMIT,
  WEEKLY_COMMISSION_LIMIT,
  WEEKLY_MINER_LIMIT,
  WEEKLY_MINER_REWARD_LIMIT,
} from '@/consts';

import {
  BlockStatsResponse,
  CommissionOverview,
  CommissionOverviewResponse,
  CommissionPeriodResponse,
  EntityStats,
  MinerCountStatsResponse,
  MinerRewardStatsResponse,
  RevenueOverviewResponse,
} from './general.entity';
import { PeriodStatsArgs, CommissionOverviewQueryArgs, LiveStatsArgs } from './general.type';
import { BlockService } from '@/entity/block/block.service';
import { StatisticsService } from '@/entity/statistics/statistics.service';
import { MemberService } from '@/entity/member/member.service';
import { GraphQLResolveInfo } from 'graphql';
import { PrismaService } from '@/service/prisma';
import graphqlFields from 'graphql-fields';
import { UserRole } from '@/type';
import { TXC } from '@/consts/db';
import Bluebird from 'bluebird';

@Service()
@Resolver()
export class GeneralResolver {
  constructor(
    private readonly blockService: BlockService,
    private readonly statisticsService: StatisticsService,
    private readonly memberService: MemberService,
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
  async blocksData(@Arg('data') data: PeriodStatsArgs): Promise<BlockStatsResponse[]> {
    switch (data.type.toLowerCase()) {
      case 'day':
        const daydata = await this.prisma.$queryRaw<BlockStatsResponse[]>`
          SELECT TO_CHAR("issuedAt", 'MM/DD/YYYY') AS base, AVG("hashRate") as "hashRate", AVG("difficulty") as "difficulty"
          FROM blocks
          GROUP BY base
          ORDER BY "base" DESC
          LIMIT ${DAILY_BLOCK_LIMIT};
        `;
        return daydata;
      case 'week':
        const weekdata = await this.prisma.$queryRaw<BlockStatsResponse[]>`
          SELECT (TO_CHAR("issuedAt", 'MM') || '-' || TO_CHAR("issuedAt" + INTERVAL '1 day', 'IW')) AS base, AVG("hashRate") as "hashRate", AVG("difficulty") as "difficulty"
          FROM blocks
          GROUP BY base
          ORDER BY "base" DESC
          LIMIT ${WEEKLY_BLOCK_LIMIT};
        `;
        return weekdata;
      case 'month':
        const monthdata = await this.prisma.$queryRaw<BlockStatsResponse[]>`
          SELECT TO_CHAR("issuedAt", 'MM/YYYY') AS base, AVG("hashRate") as "hashRate", AVG("difficulty") as "difficulty"
          FROM blocks
          GROUP BY base
          ORDER BY "base" DESC
          LIMIT ${MONTHLY_BLOCK_LIMIT};
        `;
        return monthdata;
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

  @Authorized([UserRole.Admin])
  @Query(() => CommissionOverviewResponse)
  async commissionsByWeek(
    @Args() query: CommissionOverviewQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<CommissionOverviewResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; commissions?: Promise<CommissionOverview[]> } = {};

    if ('total' in fields) {
      promises.total = this.prisma.$queryRaw`
        SELECT
          COUNT(DISTINCT commission."weekStartDate")::INTEGER AS "totalCount"
        FROM
          WeeklyCommissions commission
        WHERE
          commission."weekStartDate" <= ${query.weekStartDate};
      `.then((res) => res[0].totalCount);
    }

    if ('commissions' in fields) {
      promises.commissions = this.prisma.$queryRaw<CommissionOverview[]>`
        WITH weeks AS (
            SELECT DISTINCT "weekStartDate"
            FROM weeklycommissions
        ),
        sales_count_sum AS (
          SELECT
            weeks."weekStartDate",
            COUNT(s.id) AS "totalSale",
            SUM(COALESCE(pkg.amount, 0)) as "totalRevenue"
          FROM
            weeks
          LEFT JOIN
            Sales s ON s."orderedAt" >= weeks."weekStartDate"
            AND s."orderedAt" < weeks."weekStartDate" + INTERVAL '7 days'
          LEFT JOIN
            Packages pkg ON s."packageId" = pkg.id
          GROUP BY
            weeks."weekStartDate"
        ),
        members_count AS (
          SELECT
            weeks."weekStartDate",
            COUNT(m.id) AS "totalMember"
          FROM
            weeks
          LEFT JOIN
            Members m ON m."createdAt" < weeks."weekStartDate" + INTERVAL '7 days'
          GROUP BY
            weeks."weekStartDate"
        )
        SELECT
          c."weekStartDate" AS "weekStartDate",
          COALESCE(sales_count_sum."totalSale", 0)::INTEGER AS "totalSale",
          COALESCE(sales_count_sum."totalRevenue", 0)::INTEGER AS "totalRevenue",
          COALESCE(members_count."totalMember", 0)::INTEGER AS "totalMember",
          SUM(COALESCE(c.commission, 0))::INTEGER AS "totalAmount"
        FROM
          WeeklyCommissions c
        LEFT JOIN
          sales_count_sum ON sales_count_sum."weekStartDate" = c."weekStartDate"
        LEFT JOIN
          members_count ON members_count."weekStartDate" = c."weekStartDate"
        WHERE
          c."weekStartDate" <= ${query.weekStartDate}
        GROUP BY
          c."weekStartDate", sales_count_sum."totalSale", sales_count_sum."totalRevenue", members_count."totalMember"
        ORDER BY
          c."weekStartDate" DESC
        LIMIT
          ${query.parsePage.take}
        OFFSET
          ${query.parsePage.skip};
      `;
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; commissions?: CommissionOverview[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Query(() => [MinerCountStatsResponse])
  async memberCounts(@Arg('data') data: PeriodStatsArgs): Promise<MinerCountStatsResponse[]> {
    switch (data.type.toLowerCase()) {
      case 'day':
        const daydata = await this.prisma.$queryRaw<MinerCountStatsResponse[]>`
          SELECT TO_CHAR("createdAt", 'MM/DD/YYYY') AS base, COUNT('*')::Integer AS "minerCount"
          FROM members
          GROUP BY base
          ORDER BY "base" DESC
          LIMIT ${DAILY_MINER_LIMIT};
        `;
        return daydata;
      case 'week':
        const weekdata = await this.prisma.$queryRaw<MinerCountStatsResponse[]>`
          SELECT (TO_CHAR("createdAt", 'MM') || '-' || TO_CHAR("createdAt" + INTERVAL '1 day', 'IW')) AS base, COUNT('*')::Integer AS "minerCount"
          FROM members
          GROUP BY base
          ORDER BY "base" DESC
          LIMIT ${WEEKLY_MINER_LIMIT};
      `;
        return weekdata;
      case 'month':
        const monthdata = await this.prisma.$queryRaw<MinerCountStatsResponse[]>`
          SELECT TO_CHAR("createdAt", 'MM/YYYY') AS base, COUNT('*')::Integer AS "minerCount"
          FROM members
          GROUP BY base
          ORDER BY "base" DESC
          LIMIT ${MONTHLY_MINER_LIMIT};
        `;
        return monthdata;
      case 'quarter':
        const quarterdata = await this.prisma.$queryRaw<MinerCountStatsResponse[]>`
          SELECT TO_CHAR("createdAt", 'YYYY "Q"Q') AS base, COUNT('*')::Integer AS "minerCount"
          FROM members
          GROUP BY base
          ORDER BY "base" DESC
          LIMIT ${QUATER_MINER_LIMIT};
        `;
        return quarterdata;
      default:
        return [];
    }
  }

  @Query(() => [MinerRewardStatsResponse])
  async memberRewards(@Arg('data') data: PeriodStatsArgs): Promise<MinerRewardStatsResponse[]> {
    switch (data.type.toLowerCase()) {
      case 'day':
        const daydata = await this.prisma.$queryRaw<MinerRewardStatsResponse[]>`
          SELECT TO_CHAR("issuedAt", 'MM/DD/YYYY') AS base, COALESCE(AVG("txcShared"), 0) / ${TXC} AS "reward"
          FROM member_statistics
          GROUP BY base
          ORDER BY "base" DESC
          LIMIT ${DAILY_MINER_REWARD_LIMIT};
        `;
        return daydata;
      case 'week':
        const weekdata = await this.prisma.$queryRaw<MinerRewardStatsResponse[]>`
          SELECT (TO_CHAR("issuedAt", 'MM') || '-' || TO_CHAR("issuedAt" + INTERVAL '1 day', 'IW')) AS base, COALESCE(AVG("txcShared"), 0) / ${TXC} AS "reward"
          FROM member_statistics
          GROUP BY base
          ORDER BY "base" DESC
          LIMIT ${WEEKLY_MINER_REWARD_LIMIT};
      `;
        return weekdata;
      case 'month':
        const monthdata = await this.prisma.$queryRaw<MinerRewardStatsResponse[]>`
          SELECT TO_CHAR("issuedAt", 'MM/YYYY') AS base, COALESCE(AVG("txcShared"), 0) / ${TXC} AS "reward"
          FROM member_statistics
          GROUP BY base
          ORDER BY "base" DESC
          LIMIT ${MONTHLY_MINER_REWARD_LIMIT};
        `;
        return monthdata;
      case 'quarter':
        const quarterdata = await this.prisma.$queryRaw<MinerRewardStatsResponse[]>`
          SELECT TO_CHAR("issuedAt", 'YYYY "Q"Q') AS base, COALESCE(AVG("txcShared"), 0) / ${TXC} AS "reward"
          FROM member_statistics
          GROUP BY base
          ORDER BY "base" DESC
          LIMIT ${QUATER_MINER_REWARD_LIMIT};
        `;
        return quarterdata;
      default:
        return [];
    }
  }

  @Query(() => RevenueOverviewResponse)
  async revenueOverview(): Promise<RevenueOverviewResponse> {
    const revenueQuery = this.prisma.$queryRaw`
      SELECT COALESCE(SUM(packages.amount), 0)::INTEGER
      FROM sales
      LEFT JOIN packages ON sales."packageId" = packages.id
    `.then((res) => res[0].coalesce);
    const commissionPendingQuery = this.prisma.$queryRaw`
      SELECT COALESCE(SUM(weeklycommissions.commission), 0)::INTEGER
      FROM weeklycommissions
      WHERE status='PENDING'
    `.then((res) => res[0].coalesce);
    const commissionApprovedPaidQuery = this.prisma.$queryRaw`
    SELECT COALESCE(SUM(weeklycommissions.commission), 0)::INTEGER
    FROM weeklycommissions
    WHERE status='APPROVED' OR status='PAID'
  `.then((res) => res[0].coalesce);
    const mineElectricyQuery = this.prisma.$queryRaw`
      SELECT COALESCE(SUM(proofs.amount), 0)::INTEGER
      FROM proofs
      WHERE type = 'MINEELECTRICITY'
    `.then((res) => res[0].coalesce);
    const mineFacilityQuery = this.prisma.$queryRaw`
      SELECT COALESCE(SUM(proofs.amount), 0)::INTEGER
      FROM proofs
      WHERE type = 'MINEFACILITYRENTMORTAGE'
    `.then((res) => res[0].coalesce);
    const mineMaintainanceQuery = this.prisma.$queryRaw`
      SELECT COALESCE(SUM(proofs.amount), 0)::INTEGER
      FROM proofs
      WHERE type = 'MINEFACILITYRENTMORTAGE'
    `.then((res) => res[0].coalesce);
    const mineNewEquipmentQuery = this.prisma.$queryRaw`
    SELECT COALESCE(SUM(proofs.amount), 0)::INTEGER
    FROM proofs
    WHERE type = 'MINENEWEQUIPMENT'
  `.then((res) => res[0].coalesce);
    const infrastructureQuery = this.prisma.$queryRaw`
      SELECT COALESCE(SUM(proofs.amount), 0)::INTEGER
      FROM proofs
      WHERE type = 'INFRASTRUCTURE'
    `.then((res) => res[0].coalesce);
    const marketingMineTXCPromotionQuery = this.prisma.$queryRaw`
      SELECT COALESCE(SUM(proofs.amount), 0)::INTEGER
      FROM proofs
      WHERE type = 'MARKETINGMINETXCPROMOTION'
    `.then((res) => res[0].coalesce);
    const marketingTXCPromotionQuery = this.prisma.$queryRaw`
      SELECT COALESCE(SUM(proofs.amount), 0)::INTEGER
      FROM proofs
      WHERE type = 'MARKETINGTXCPROMOTION'
    `.then((res) => res[0].coalesce);

    const [
      revenue,
      commissionPending,
      commissionApprovedPaid,
      mineElectricy,
      mineFacility,
      mineMaintainance,
      mineNewEquipment,
      infrastructure,
      marketingMineTXCPromotion,
      marketingTXCPromotion,
    ] = await Bluebird.all([
      revenueQuery,
      commissionPendingQuery,
      commissionApprovedPaidQuery,
      mineElectricyQuery,
      mineFacilityQuery,
      mineMaintainanceQuery,
      mineNewEquipmentQuery,
      infrastructureQuery,
      marketingMineTXCPromotionQuery,
      marketingTXCPromotionQuery,
    ]);
    return {
      revenue,
      commissionPending,
      commissionApprovedPaid,
      mineElectricy,
      mineFacility,
      mineMaintainance,
      mineNewEquipment,
      infrastructure,
      marketingMineTXCPromotion,
      marketingTXCPromotion,
    };
  }

  @Query(() => [CommissionPeriodResponse])
  async commissionByPeriod(
    @Arg('data') data: PeriodStatsArgs
  ): Promise<CommissionPeriodResponse[]> {
    switch (data.type.toLowerCase()) {
      case 'week':
        const weekdata = await this.prisma.$queryRaw<CommissionPeriodResponse[]>`
          SELECT (TO_CHAR("weekStartDate", 'MM') || '-' || TO_CHAR("weekStartDate" + INTERVAL '1 day', 'IW')) AS base, COALESCE(SUM("commission"), 0)::INTEGER AS "commission"
          FROM weeklycommissions
          WHERE status='PAID'
          GROUP BY base
          ORDER BY "base" DESC
          LIMIT ${WEEKLY_COMMISSION_LIMIT};
      `;
        return weekdata;
      case 'month':
        const monthdata = await this.prisma.$queryRaw<CommissionPeriodResponse[]>`
          SELECT TO_CHAR("weekStartDate", 'MM/YYYY') AS base, COALESCE(SUM("commission"), 0)::INTEGER AS "commission"
          FROM weeklycommissions
          WHERE status='PAID'
          GROUP BY base
          ORDER BY "base" DESC
          LIMIT ${MONTHLY_COMMISSION_LIMIT};
        `;
        return monthdata;
      case 'quarter':
        const quarterdata = await this.prisma.$queryRaw<CommissionPeriodResponse[]>`
          SELECT TO_CHAR("weekStartDate", 'YYYY "Q"Q') AS base, COALESCE(SUM("commission"), 0)::INTEGER AS "commission"
          FROM weeklycommissions
          WHERE status='PAID'
          GROUP BY base
          ORDER BY "base" DESC
          LIMIT ${QUATER_COMMISSION_LIMIT};
        `;
        return quarterdata;
      default:
        return [];
    }
  }
}
