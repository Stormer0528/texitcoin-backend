import { Inject, Service } from 'typedi';

import { ColumnInterface } from '@/type';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/service/prisma';
import { BalancesByMemberQueryArgs, MemberInOutRevenueQueryArgs } from './general.type';
import { getColumnQuery } from '@/utils/getColumnQuery';
import { ORDER } from '@/consts/db';
import { parseFilterManually } from '@/utils/parseFilterManually';
import { INFINITE } from '@/consts';

export const MEMBER_INOUT_REVENUE_COLUMNS: ColumnInterface[] = [
  {
    column: 'id',
    sql: Prisma.sql`"id"`,
  },
  { column: 'username', sql: Prisma.sql`"username"` },
  { column: 'fullName', sql: Prisma.sql`"fullName"` },
  { column: 'amount', sql: Prisma.sql`"amount"` },
  { column: 'commission', sql: Prisma.sql`"commission"` },
  {
    column: 'percent',
    sql: Prisma.sql`"percent"`,
  },
  { column: 'cashCommissionPotential', sql: Prisma.sql`"cashCommissionPotential"` },
];

export const BALANCES_BY_MEMBER_COLUMNS: ColumnInterface[] = [
  {
    column: 'id',
    sql: Prisma.sql`"id"`,
  },
  { column: 'username', sql: Prisma.sql`"username"` },
  { column: 'fullName', sql: Prisma.sql`"fullName"` },
  { column: 'balance', sql: Prisma.sql`"balance"` },
];

@Service()
export class GeneralService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getMemberInOutRevenus(params: MemberInOutRevenueQueryArgs) {
    const { orderBy = { percent: 'desc' }, parsePage, filter } = params;

    const orderQueryItems = (orderBy ? (Array.isArray(orderBy) ? orderBy : [orderBy]) : []).flatMap(
      (order) => Object.entries(order).map(([column, order]) => ({ column, order }))
    );

    const fullOrderQuery = orderQueryItems.length
      ? Prisma.sql`
          ORDER BY ${Prisma.join(
            orderQueryItems.map(
              (orderQueryItem) =>
                Prisma.sql`${getColumnQuery(orderQueryItem.column, MEMBER_INOUT_REVENUE_COLUMNS).sql} ${ORDER[orderQueryItem.order.toUpperCase()]} NULLS LAST`
            ),
            ', '
          )}
        `
      : Prisma.empty;

    const whereQuery = parseFilterManually(MEMBER_INOUT_REVENUE_COLUMNS, filter);

    const res = await this.prisma.$queryRaw<any>`
        WITH
          "salesByMember" AS (
            SELECT
              "memberId",
              SUM(PACKAGES.AMOUNT) AS AMOUNT
            FROM
              SALES
              LEFT JOIN PACKAGES ON SALES."packageId" = PACKAGES.ID
            WHERE
              "amount" > 0
            GROUP BY
              "memberId"
          ),
          "commissionsByMember" AS (
            SELECT
              "memberId",
              SUM(COMMISSION) AS COMMISSION
            FROM
              WEEKLYCOMMISSIONS
            WHERE
              "commission" > 0
              AND "status"::TEXT != 'NONE'
              AND "status"::TEXT != 'PREVIEW'
            GROUP BY
              "memberId"
          ),
          "sponsorSalesPointsByMember" AS (
            SELECT
              M1.ID,
              SUM("salesByMember"."amount") AS AMOUNT,
              SUM(M2."point") AS POINT
            FROM
              MEMBERS AS M1
              LEFT JOIN MEMBERS AS M2 ON M1.ID = M2."sponsorId" AND M1.ID != M2.ID
              LEFT JOIN "salesByMember" ON "salesByMember"."memberId" = M2.ID
            GROUP BY
              M1.ID
          ),
          "cashBalancesByMember" AS (
            SELECT
              "memberId",
              SUM("amountInCents")::Int AS balance
            FROM
              balances
            WHERE
              type = 'CASH'
            GROUP BY
              "memberId"
          ),
          PRERESULT AS (
            SELECT
              MEMBERS.ID,
              MEMBERS.USERNAME,
              MEMBERS."fullName",
              MEMBERS."status",
              COALESCE("sponsorSalesPointsByMember"."amount", 0)::Int AS AMOUNT,
              COALESCE("commissionsByMember".COMMISSION, 0)::Int AS COMMISSION,
              ((MEMBERS."point" + COALESCE("sponsorSalesPointsByMember".POINT, 0)) * 1000 * 100 - COALESCE("cashBalancesByMember".balance, 0))::Int AS "cashCommissionPotential"
            FROM
              MEMBERS
              LEFT JOIN "sponsorSalesPointsByMember" ON MEMBERS.ID = "sponsorSalesPointsByMember"."id"
              LEFT JOIN "commissionsByMember" ON MEMBERS.ID = "commissionsByMember"."memberId"
              LEFT JOIN "cashBalancesByMember" ON MEMBERS.ID = "cashBalancesByMember"."memberId"
            WHERE
              MEMBERS.status = true
        ),
        FINALRESULT AS (
          SELECT
            *,
            ROUND(
              CASE
                WHEN COMMISSION > 0 AND AMOUNT = 0 THEN ${INFINITE}
                WHEN AMOUNT = 0 THEN NULL
                ELSE COMMISSION * 1.0 / AMOUNT * 100
              END,
              2
            ) AS PERCENT
          FROM
            PRERESULT
        )
        SELECT *
        FROM FINALRESULT
        ${whereQuery}
        ${fullOrderQuery}
        LIMIT ${parsePage.take ?? 50}
        OFFSET ${parsePage.skip ?? 0}
      `;

    return res;
  }

  async getMemberInOutRevenusCount({ filter }: MemberInOutRevenueQueryArgs): Promise<number> {
    const whereQuery = parseFilterManually(MEMBER_INOUT_REVENUE_COLUMNS, filter);

    return this.prisma.$queryRaw<{ count: bigint }[]>`
        WITH
          "salesByMember" AS (
            SELECT
              "memberId",
              SUM(PACKAGES.AMOUNT) AS AMOUNT
            FROM
              SALES
              LEFT JOIN PACKAGES ON SALES."packageId" = PACKAGES.ID
            WHERE
              "amount" > 0
            GROUP BY
              "memberId"
          ),
          "commissionsByMember" AS (
            SELECT
              "memberId",
              SUM(COMMISSION) AS COMMISSION
            FROM
              WEEKLYCOMMISSIONS
            WHERE
              "commission" > 0
              AND "status"::TEXT != 'NONE'
              AND "status"::TEXT != 'PREVIEW'
            GROUP BY
              "memberId"
          ),
          "sponsorSalesPointsByMember" AS (
            SELECT
              M1.ID,
              SUM("salesByMember"."amount") AS AMOUNT,
              SUM(M2."point") AS POINT
            FROM
              MEMBERS AS M1
              LEFT JOIN MEMBERS AS M2 ON M1.ID = M2."sponsorId" AND M1.ID != M2.ID
              LEFT JOIN "salesByMember" ON "salesByMember"."memberId" = M2.ID
            GROUP BY
              M1.ID
          ),
          "cashBalancesByMember" AS (
            SELECT
              "memberId",
              SUM("amountInCents")::Int AS balance
            FROM
              balances
            WHERE
              type = 'CASH'
            GROUP BY
              "memberId"
          ),
          PRERESULT AS (
            SELECT
              MEMBERS.ID,
              MEMBERS.USERNAME,
              MEMBERS."fullName",
              MEMBERS."status",
              COALESCE("sponsorSalesPointsByMember"."amount", 0)::Int AS AMOUNT,
              COALESCE("commissionsByMember".COMMISSION, 0)::Int AS COMMISSION,
              ((MEMBERS."point" + COALESCE("sponsorSalesPointsByMember".POINT, 0)) * 1000 * 100 - COALESCE("cashBalancesByMember".balance, 0))::Int AS "cashCommissionPotential"
            FROM
              MEMBERS
              LEFT JOIN "sponsorSalesPointsByMember" ON MEMBERS.ID = "sponsorSalesPointsByMember"."id"
              LEFT JOIN "commissionsByMember" ON MEMBERS.ID = "commissionsByMember"."memberId"
              LEFT JOIN "cashBalancesByMember" ON MEMBERS.ID = "cashBalancesByMember"."memberId"
            WHERE
              MEMBERS.status = true
        ),
        FINALRESULT AS (
          SELECT
            *,
            ROUND(
              CASE
                WHEN COMMISSION > 0 AND AMOUNT = 0 THEN ${INFINITE}
                WHEN AMOUNT = 0 THEN NULL
                ELSE COMMISSION * 1.0 / AMOUNT * 100
              END,
              2
            ) AS PERCENT
          FROM
            PRERESULT
        )
        SELECT count(*)
        FROM FINALRESULT
        ${whereQuery}
      `.then((res) => Number(res[0].count));
  }

  async getBalancesByMember(params: BalancesByMemberQueryArgs) {
    const { orderBy = { balance: 'desc' }, parsePage, filter } = params;

    const orderQueryItems = (orderBy ? (Array.isArray(orderBy) ? orderBy : [orderBy]) : []).flatMap(
      (order) => Object.entries(order).map(([column, order]) => ({ column, order }))
    );

    const fullOrderQuery = orderQueryItems.length
      ? Prisma.sql`
          ORDER BY ${Prisma.join(
            orderQueryItems.map(
              (orderQueryItem) =>
                Prisma.sql`${getColumnQuery(orderQueryItem.column, BALANCES_BY_MEMBER_COLUMNS).sql} ${ORDER[orderQueryItem.order.toUpperCase()]} NULLS LAST`
            ),
            ', '
          )}
        `
      : Prisma.empty;

    const whereQuery = parseFilterManually(BALANCES_BY_MEMBER_COLUMNS, filter);

    const res = await this.prisma.$queryRaw<any>`
        WITH
          "balancesByMemberId" AS (
            SELECT
              "memberId",
              SUM("amountInCents")::Int AS balance
            FROM
              balances
            GROUP BY
              "memberId"
          ),
        FINALRESULT AS (
          SELECT
            id,
            username,
            "fullName",
            COALESCE(balance, 0) AS balance
          FROM
            members
            LEFT JOIN "balancesByMemberId" ON members.id = "balancesByMemberId"."memberId"
        )
        SELECT *
        FROM FINALRESULT
        ${whereQuery}
        ${fullOrderQuery}
        LIMIT ${parsePage.take ?? 50}
        OFFSET ${parsePage.skip ?? 0}
      `;

    return res;
  }

  async getBalancesByMemberCount({ filter }: BalancesByMemberQueryArgs): Promise<number> {
    const whereQuery = parseFilterManually(BALANCES_BY_MEMBER_COLUMNS, filter);

    return this.prisma.$queryRaw<{ count: bigint }[]>`
        WITH
          "balancesByMemberId" AS (
            SELECT
              "memberId",
              SUM("amountInCents") AS balance
            FROM
              balances
            GROUP BY
              "memberId"
          ),
        FINALRESULT AS (
          SELECT
            id,
            username,
            "fullName",
            COALESCE(balance, 0) AS balance
          FROM
            members
            LEFT JOIN "balancesByMemberId" ON members.id = "balancesByMemberId"."memberId"
        )
        SELECT count(*)
        FROM FINALRESULT
        ${whereQuery}
      `.then((res) => Number(res[0].count));
  }
}
