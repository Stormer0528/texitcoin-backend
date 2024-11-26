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
  DAILY_STATISTICS_LIMIT,
  GET_MINING_INFO,
  MONTHLY_BLOCK_LIMIT,
  MONTHLY_COMMISSION_LIMIT,
  MONTHLY_MINER_LIMIT,
  MONTHLY_MINER_REWARD_LIMIT,
  MONTHLY_STATISTICS_LIMIT,
  QUATER_COMMISSION_LIMIT,
  QUATER_MINER_LIMIT,
  QUATER_MINER_REWARD_LIMIT,
  WEEKLY_BLOCK_LIMIT,
  WEEKLY_COMMISSION_LIMIT,
  WEEKLY_MINER_LIMIT,
  WEEKLY_MINER_REWARD_LIMIT,
  WEEKLY_STATISTICS_LIMIT,
} from '@/consts';

import {
  BlockStatsResponse,
  CommissionOverview,
  CommissionOverviewResponse,
  CommissionPeriodResponse,
  EntityStats,
  MinerCountStatsResponse,
  AverageMinerRewardStatsResponse,
  RevenueOverviewResponse,
  HashPowerResponse,
  TopRecruitersResponse,
  TopEarnersResponse,
  RevenueSpentItem,
  LatestStatistics,
  TXCSharedResponse,
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

import shelljs from 'shelljs';
import { proofTypeData } from 'prisma/seed/proof';

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
          SELECT "issuedAt"::Date as "baseDate", TO_CHAR("issuedAt", 'MM/DD/YYYY') AS base, AVG("hashRate") as "hashRate", AVG("difficulty") as "difficulty"
          FROM blocks
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${DAILY_BLOCK_LIMIT};
        `;
        return daydata;
      case 'week':
        const weekdata = await this.prisma.$queryRaw<BlockStatsResponse[]>`
          SELECT DATE_TRUNC('week', "createdAt" + INTERVAL '1 day') - INTERVAL '1 day' as "baseDate", (TO_CHAR("issuedAt", 'MM') || '-' || TO_CHAR("issuedAt" + INTERVAL '1 day', 'IW')) AS base, AVG("hashRate") as "hashRate", AVG("difficulty") as "difficulty"
          FROM blocks
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${WEEKLY_BLOCK_LIMIT};
        `;
        return weekdata;
      case 'month':
        const monthdata = await this.prisma.$queryRaw<BlockStatsResponse[]>`
          SELECT DATE_TRUNC('month', "createdAt") as "baseDate", TO_CHAR("issuedAt", 'MM/YYYY') AS base, AVG("hashRate") as "hashRate", AVG("difficulty") as "difficulty"
          FROM blocks
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
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
  async newMemberCounts(@Arg('data') data: PeriodStatsArgs): Promise<MinerCountStatsResponse[]> {
    switch (data.type.toLowerCase()) {
      case 'day':
        const daydata = await this.prisma.$queryRaw<MinerCountStatsResponse[]>`
          SELECT "createdAt"::Date as "baseDate", TO_CHAR("createdAt", 'MM/DD/YYYY') AS base, COUNT('*')::Integer AS "minerCount"
          FROM members
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${DAILY_MINER_LIMIT};
        `;
        return daydata;
      case 'week':
        const weekdata = await this.prisma.$queryRaw<MinerCountStatsResponse[]>`
          SELECT DATE_TRUNC('week', "createdAt" + INTERVAL '1 day') - INTERVAL '1 day' as "baseDate", (TO_CHAR("createdAt", 'MM') || '-' || TO_CHAR("createdAt" + INTERVAL '1 day', 'IW')) AS base, COUNT('*')::Integer AS "minerCount"
          FROM members
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${WEEKLY_MINER_LIMIT};
      `;
        return weekdata;
      case 'month':
        const monthdata = await this.prisma.$queryRaw<MinerCountStatsResponse[]>`
          SELECT DATE_TRUNC('month', "createdAt") as "baseDate", TO_CHAR("createdAt", 'MM/YYYY') AS base, COUNT('*')::Integer AS "minerCount"
          FROM members
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${MONTHLY_MINER_LIMIT};
        `;
        return monthdata;
      case 'quarter':
        const quarterdata = await this.prisma.$queryRaw<MinerCountStatsResponse[]>`
          SELECT DATE_TRUNC('quarter', "createdAt") as "baseDate", TO_CHAR("createdAt", 'YYYY "Q"Q') AS base, COUNT('*')::Integer AS "minerCount"
          FROM members
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${QUATER_MINER_LIMIT};
        `;
        return quarterdata;
      default:
        return [];
    }
  }

  @Query(() => [MinerCountStatsResponse])
  async totalMemberCounts(@Arg('data') data: PeriodStatsArgs): Promise<MinerCountStatsResponse[]> {
    switch (data.type.toLowerCase()) {
      case 'day':
        const daydata = await this.prisma.$queryRaw<MinerCountStatsResponse[]>`
          WITH UNIQUE_BASES AS (
              SELECT "createdAt"::Date as "baseDate", TO_CHAR(members."createdAt", 'MM/DD/YYYY') AS base
              FROM members
              GROUP BY "baseDate", base
              ORDER BY "baseDate" DESC
          )
          SELECT "baseDate", base, COUNT('*')::Integer AS "minerCount"
          FROM UNIQUE_BASES
          LEFT JOIN members m ON m."createdAt"::Date <= "baseDate"
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${DAILY_MINER_LIMIT};
        `;
        return daydata;
      case 'week':
        const weekdata = await this.prisma.$queryRaw<MinerCountStatsResponse[]>`
          WITH UNIQUE_BASES AS (
              SELECT DATE_TRUNC('week', "createdAt" + INTERVAL '1 day') - INTERVAL '1 day' as "baseDate", (TO_CHAR("createdAt", 'MM') || '-' || TO_CHAR("createdAt" + INTERVAL '1 day', 'IW')) AS base
              FROM members
              GROUP BY "baseDate", base
              ORDER BY "baseDate" DESC
          )
          SELECT "baseDate", base, COUNT('*')::Integer AS "minerCount"
          FROM UNIQUE_BASES
          LEFT JOIN members m ON (DATE_TRUNC('week', m."createdAt" + INTERVAL '1 day') - INTERVAL '1 day') <= "baseDate"
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${WEEKLY_MINER_LIMIT};
        `;
        return weekdata;
      case 'month':
        const monthdata = await this.prisma.$queryRaw<MinerCountStatsResponse[]>`
          WITH UNIQUE_BASES AS (
              SELECT DATE_TRUNC('month', "createdAt") as "baseDate", TO_CHAR("createdAt", 'MM/YYYY') AS base
              FROM members
              GROUP BY "baseDate", base
              ORDER BY "baseDate" DESC
          )
          SELECT "baseDate", base, COUNT('*')::Integer AS "minerCount"
          FROM UNIQUE_BASES
          LEFT JOIN members m ON DATE_TRUNC('month', m."createdAt") <= "baseDate"
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${MONTHLY_MINER_LIMIT};
        `;
        return monthdata;
      case 'quarter':
        const quarterdata = await this.prisma.$queryRaw<MinerCountStatsResponse[]>`
          WITH UNIQUE_BASES AS (
              SELECT DATE_TRUNC('quarter', "createdAt") as "baseDate", TO_CHAR("createdAt", 'YYYY "Q"Q') AS base
              FROM members
              GROUP BY "baseDate", base
              ORDER BY "baseDate" DESC
          )
          SELECT "baseDate", base, COUNT('*')::Integer AS "minerCount"
          FROM UNIQUE_BASES
          LEFT JOIN members m ON DATE_TRUNC('quarter', m."createdAt") <= "baseDate"
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${QUATER_MINER_LIMIT};
        `;
        return quarterdata;
      default:
        return [];
    }
  }

  @Query(() => [AverageMinerRewardStatsResponse])
  async averageMemberReward(
    @Arg('data') data: PeriodStatsArgs
  ): Promise<AverageMinerRewardStatsResponse[]> {
    switch (data.type.toLowerCase()) {
      case 'day':
        const daydata = await this.prisma.$queryRaw<AverageMinerRewardStatsResponse[]>`
          SELECT "issuedAt"::Date as "baseDate", TO_CHAR("issuedAt", 'MM/DD/YYYY') AS base, COALESCE(AVG("txcShared"), 0) / ${TXC} AS "reward"
          FROM member_statistics
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${DAILY_MINER_REWARD_LIMIT};
        `;
        return daydata;
      case 'week':
        const weekdata = await this.prisma.$queryRaw<AverageMinerRewardStatsResponse[]>`
          SELECT DATE_TRUNC('week', "issuedAt" + INTERVAL '1 day') - INTERVAL '1 day' as "baseDate", (TO_CHAR("issuedAt", 'MM') || '-' || TO_CHAR("issuedAt" + INTERVAL '1 day', 'IW')) AS base, COALESCE(AVG("txcShared"), 0) / ${TXC} AS "reward"
          FROM member_statistics
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${WEEKLY_MINER_REWARD_LIMIT};
      `;
        return weekdata;
      case 'month':
        const monthdata = await this.prisma.$queryRaw<AverageMinerRewardStatsResponse[]>`
          SELECT DATE_TRUNC('month', "issuedAt") as "baseDate", TO_CHAR("issuedAt", 'MM/YYYY') AS base, COALESCE(AVG("txcShared"), 0) / ${TXC} AS "reward"
          FROM member_statistics
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${MONTHLY_MINER_REWARD_LIMIT};
        `;
        return monthdata;
      case 'quarter':
        const quarterdata = await this.prisma.$queryRaw<AverageMinerRewardStatsResponse[]>`
          SELECT DATE_TRUNC('quarter', "issuedAt") as "baseDate", TO_CHAR("issuedAt", 'YYYY "Q"Q') AS base, COALESCE(AVG("txcShared"), 0) / ${TXC} AS "reward"
          FROM member_statistics
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
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
    const commissionApprovedQuery = this.prisma.$queryRaw`
    SELECT COALESCE(SUM(weeklycommissions.commission), 0)::INTEGER
    FROM weeklycommissions
    WHERE status='APPROVED'
    `.then((res) => res[0].coalesce);
    const commissionPaidQuery = this.prisma.$queryRaw`
    SELECT COALESCE(SUM(weeklycommissions.commission), 0)::INTEGER
    FROM weeklycommissions
    WHERE status='PAID'
  `.then((res) => res[0].coalesce);

    const proofQuery = this.prisma.$queryRaw<RevenueSpentItem[]>`
      SELECT proofs.type as label, COALESCE(SUM(proofs.amount), 0)::INTEGER as value
      FROM proofs
      WHERE proofs.type != 'SALE' AND proofs.type != 'COMMISSION'
      GROUP BY proofs.type
    `;

    const [revenue, commissionPending, commissionApproved, commissionPaid, proofs] =
      await Bluebird.all([
        revenueQuery,
        commissionPendingQuery,
        commissionApprovedQuery,
        commissionPaidQuery,
        proofQuery,
      ]);
    return {
      revenue,
      spent: [
        {
          label: 'Pending Commission',
          value: commissionPending,
        },
        {
          label: 'Approved Commission',
          value: commissionApproved,
        },
        {
          label: 'Paid Commission',
          value: commissionPaid,
        },
        ...proofs
          .map((proof) => {
            const ptype = proofTypeData.find((ptd) => ptd.proofType === proof.label);
            return ptype
              ? {
                  label: ptype.display,
                  value: proof.value,
                }
              : null;
          })
          .filter(Boolean),
      ],
    };
  }

  @Query(() => [CommissionPeriodResponse])
  async commissionByPeriod(
    @Arg('data') data: PeriodStatsArgs
  ): Promise<CommissionPeriodResponse[]> {
    switch (data.type.toLowerCase()) {
      case 'week':
        const weekdata = await this.prisma.$queryRaw<CommissionPeriodResponse[]>`
          SELECT DATE_TRUNC('week', "weekStartDate" + INTERVAL '1 day') - INTERVAL '1 day' as "baseDate", (TO_CHAR("weekStartDate", 'MM') || '-' || TO_CHAR("weekStartDate" + INTERVAL '1 day', 'IW')) AS base, COALESCE(SUM("commission"), 0)::INTEGER AS "commission"
          FROM weeklycommissions
          WHERE status='PAID'
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${WEEKLY_COMMISSION_LIMIT};
      `;
        return weekdata;
      case 'month':
        const monthdata = await this.prisma.$queryRaw<CommissionPeriodResponse[]>`
          SELECT DATE_TRUNC('month', "weekStartDate") as "baseDate", TO_CHAR("weekStartDate", 'MM/YYYY') AS base, COALESCE(SUM("commission"), 0)::INTEGER AS "commission"
          FROM weeklycommissions
          WHERE status='PAID'
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${MONTHLY_COMMISSION_LIMIT};
        `;
        return monthdata;
      case 'quarter':
        const quarterdata = await this.prisma.$queryRaw<CommissionPeriodResponse[]>`
          SELECT DATE_TRUNC('quarter', "weekStartDate") as "baseDate", TO_CHAR("weekStartDate", 'YYYY "Q"Q') AS base, COALESCE(SUM("commission"), 0)::INTEGER AS "commission"
          FROM weeklycommissions
          WHERE status='PAID'
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${QUATER_COMMISSION_LIMIT};
        `;
        return quarterdata;
      default:
        return [];
    }
  }

  @Query(() => HashPowerResponse)
  async hashPowerResponse(): Promise<HashPowerResponse> {
    try {
      const { stdout: strMiningInfo } = shelljs.exec(GET_MINING_INFO);
      const miningInfo = JSON.parse(strMiningInfo);

      const soldHashPower = await this.prisma.$queryRaw`
      SELECT SUM(pkg.token)::Float as "totalHashPower"
      FROM sales
      LEFT JOIN packages pkg ON sales."packageId" = pkg.id
    `.then((res) => res[0].totalHashPower);

      return {
        actualHashPower: miningInfo.networkhashps,
        soldHashPower,
      };
    } catch (_err) {
      throw new Error('Error occurred while getting network hash power');
    }
  }

  @Query(() => [TopRecruitersResponse])
  async topRecruiters(): Promise<TopRecruitersResponse[]> {
    return this.prisma.member.findMany({
      orderBy: {
        totalIntroducers: 'desc',
        createdAt: 'asc',
      },
      take: 3,
    });
  }

  @Query(() => [TopEarnersResponse])
  async topEarners(): Promise<TopEarnersResponse[]> {
    return this.prisma.$queryRaw<TopEarnersResponse[]>`
      SELECT members.id, members."fullName", SUM(c.commission)::Integer as earned
      FROM members
      LEFT JOIN weeklycommissions c ON c."memberId" = members.id
      WHERE c.status = 'PAID'
      GROUP BY members.id, members."fullName"
      ORDER BY earned DESC
      LIMIT 3
    `;
  }

  @Query(() => [LatestStatistics])
  async latestStatistics(): Promise<LatestStatistics[]> {
    const statistics = await this.statisticsService.getLatestNStatistics(5);
    return statistics.map((st) => ({
      ...st,
      txcShared: Number(st.txcShared) / TXC,
    })) as LatestStatistics[];
  }

  @Query(() => [TXCSharedResponse])
  async txcShares(@Arg('data') data: PeriodStatsArgs): Promise<TXCSharedResponse[]> {
    switch (data.type.toLowerCase()) {
      case 'day':
        const daydata = await this.prisma.$queryRaw<TXCSharedResponse[]>`
          SELECT "issuedAt"::Date as "baseDate", TO_CHAR("issuedAt", 'MM/DD/YYYY') AS base, COALESCE(AVG("txcShared"), 0) / ${TXC} AS "txc"
          FROM statistics
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${DAILY_STATISTICS_LIMIT};
        `;
        return daydata;
      case 'week':
        const weekdata = await this.prisma.$queryRaw<TXCSharedResponse[]>`
          SELECT DATE_TRUNC('week', "issuedAt" + INTERVAL '1 day') - INTERVAL '1 day' as "baseDate", (TO_CHAR("issuedAt", 'MM') || '-' || TO_CHAR("issuedAt" + INTERVAL '1 day', 'IW')) AS base, COALESCE(AVG("txcShared"), 0) / ${TXC} AS "txc"
          FROM statistics
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${WEEKLY_STATISTICS_LIMIT};
        `;
        return weekdata;
      case 'month':
        const monthdata = await this.prisma.$queryRaw<TXCSharedResponse[]>`
          SELECT DATE_TRUNC('month', "issuedAt") as "baseDate", TO_CHAR("issuedAt", 'MM/YYYY') AS base, COALESCE(AVG("txcShared"), 0) / ${TXC} AS "txc"
          FROM statistics
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${MONTHLY_STATISTICS_LIMIT};
        `;
        return monthdata;
      case 'quarter':
        const quarterdata = await this.prisma.$queryRaw<TXCSharedResponse[]>`
          SELECT DATE_TRUNC('quarter', "issuedAt") as "baseDate", TO_CHAR("issuedAt", 'YYYY "Q"Q') AS base, COALESCE(AVG("txcShared"), 0) / ${TXC} AS "txc"
          FROM statistics
          GROUP BY "baseDate", base
          ORDER BY "baseDate" DESC
          LIMIT ${MONTHLY_STATISTICS_LIMIT};
        `;
        return quarterdata;
      default:
        return [];
    }
  }
}
