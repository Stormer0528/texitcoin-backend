import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import { CreateSaleInput, SaleQueryArgs, UpdateSaleInput } from './sale.type';
import { Prisma, Sale } from '@prisma/client';
import { ColumnInterface } from '@/type';
import { getColumnQuery } from '@/utils/getColumnQuery';
import { parseFilterManually } from '@/utils/parseFilterManually';
import { ORDER } from '@/consts/db';
import { COMMISSION_PAYMENT_METHOD, P2P_PAYMENT_METHOD, P2P_TRANSACTION_FEE } from '@/consts';

const SALE_COLUMNS: ColumnInterface[] = [
  {
    column: 'ID',
    sql: Prisma.sql`"sales"."ID"`,
  },
  { column: 'member.username', sql: Prisma.sql`"members"."username"` },
  { column: 'memberId', sql: Prisma.sql`"memberId"` },
  { column: 'status', sql: Prisma.sql`"sales"."status"` },
  { column: 'member.assetId', sql: Prisma.sql`"member"."assetId"` },
  {
    column: 'package.productName',
    sql: Prisma.sql`"packages"."productName"`,
  },
  {
    column: 'paymentMethod',
    sql: Prisma.sql`"paymentMethod"`,
  },
  { column: 'package.amount', sql: Prisma.sql`"packages"."amount"` },
  { column: 'package.token', sql: Prisma.sql`"packages"."token"` },
  { column: 'package.point', sql: Prisma.sql`"packages"."point"` },
  { column: 'orderedAt', sql: Prisma.sql`"orderedAt"` },
  { column: 'status', sql: Prisma.sql`"status"` },
  { column: 'createdAt', sql: Prisma.sql`"createdAt"` },
];

@Service()
export class SaleService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getSales(params: SaleQueryArgs) {
    const { orderBy, parsePage, filter } = params;

    const orderQueryItems = (orderBy ? (Array.isArray(orderBy) ? orderBy : [orderBy]) : []).flatMap(
      (order) => Object.entries(order).map(([column, order]) => ({ column, order }))
    );

    const fullOrderQuery = orderQueryItems.length
      ? Prisma.sql`
        ORDER BY ${Prisma.join(
          orderQueryItems.map(
            (orderQueryItem) =>
              Prisma.sql`${getColumnQuery(orderQueryItem.column, SALE_COLUMNS).sql} ${ORDER[orderQueryItem.order.toUpperCase()]}`
          ),
          ', '
        )}
      `
      : Prisma.empty;

    const whereQuery = parseFilterManually(SALE_COLUMNS, filter);

    const res = await this.prisma.$queryRaw<any>`
      SELECT
        "sales".*
      FROM
        "sales"
        LEFT JOIN "members" ON "sales"."memberId" = "members"."id"
        LEFT JOIN "packages" ON "sales"."packageId" = "packages"."id"
      ${whereQuery}
      ${fullOrderQuery}
      LIMIT ${parsePage.take}
      OFFSET ${parsePage.skip}
    `;

    return res;
  }

  async getSalesCountAG({ filter }: SaleQueryArgs): Promise<number> {
    const whereQuery = parseFilterManually(SALE_COLUMNS, filter);

    return this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT
        count("sales".*) AS "count"
      FROM
        "sales"
        LEFT JOIN "members" ON "sales"."memberId" = "members"."id"
        LEFT JOIN "packages" ON "sales"."packageId" = "packages"."id"
      ${whereQuery}
    `.then((res) => Number(res[0].count));
  }

  async getSalesCount(params: Pick<SaleQueryArgs, 'where'>): Promise<number> {
    return this.prisma.sale.count({
      where: params.where,
    });
  }

  async getSaleById(id: string) {
    return this.prisma.sale.findUnique({
      where: {
        id,
      },
    });
  }

  async createSale(data: Omit<CreateSaleInput, 'fileIds' | 'reflinks' | 'note'>) {
    return this.prisma.sale.create({
      data,
    });
  }

  async updateSale(data: Omit<UpdateSaleInput, 'fileIds' | 'reflinks' | 'note'>) {
    return this.prisma.sale.update({
      data,
      where: {
        id: data.id,
      },
    });
  }

  async removeSale(data: IDInput) {
    return this.prisma.sale.delete({
      where: {
        id: data.id,
      },
    });
  }

  async getMemberHashPowerById(data: IDInput) {
    const members = await this.prisma.sale.findMany({
      where: {
        memberId: data.id,
        status: true,
      },
      include: {
        package: true,
      },
    });
    return members.reduce((prev, current) => {
      return prev + current.package.token;
    }, 0);
  }

  calculateBalance(sale: Sale & { package: { amount: number } }) {
    if (!sale.package.amount) return {};

    if (sale.paymentMethod.toLowerCase() === P2P_PAYMENT_METHOD.toLowerCase()) {
      const amountInCents = sale.package.amount * 100;
      const balanceInCents = amountInCents * (1 - P2P_TRANSACTION_FEE);
      return {
        memberId: sale.toMemberId,
        amount: -balanceInCents,
        fee: amountInCents - balanceInCents,
        note: 'P2P',
      };
    } else if (sale.paymentMethod.toLowerCase() === COMMISSION_PAYMENT_METHOD.toLowerCase()) {
      const amountInCents = sale.package.amount * 100;
      return {
        memberId: sale.memberId,
        amount: amountInCents,
        fee: 0,
        note: 'COMMISSION',
      };
    }
    return {};
  }
}
