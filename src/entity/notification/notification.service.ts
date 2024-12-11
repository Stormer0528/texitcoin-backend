import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import {
  CreateNotificationInput,
  NotificationMemberQueryArgs,
  NotificationQueryArgs,
  UpdateNotificationInput,
} from './notification.type';
import { ColumnInterface } from '@/type';
import { Prisma } from '@prisma/client';
import { getColumnQuery } from '@/utils/getColumnQuery';
import { ORDER } from '@/consts/db';
import { parseFilterManually } from '@/utils/parseFilterManually';

const NOTIFICATION_COLUMNS: ColumnInterface[] = [
  { column: 'notification.id', sql: Prisma.sql`"notifications"."id"` },
  { column: 'notification.message', sql: Prisma.sql`"notification"."message"` },
  { column: 'notification.level', sql: Prisma.sql`"notification"."level"` },
  { column: 'read', sql: Prisma.sql`"read"` },
  { column: 'memberId', sql: Prisma.sql`"memberId"` },
  { column: 'createdAt', sql: Prisma.sql`"createdAt"` },
];

@Service()
export class NotificationService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getNotifications(params: NotificationQueryArgs) {
    return this.prisma.notification.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getNotificationsCount(params: NotificationQueryArgs): Promise<number> {
    return this.prisma.notification.count({ where: params.where });
  }

  async getNotificationsByMemberID(params: NotificationMemberQueryArgs) {
    const { orderBy, parsePage, filter } = params;

    const orderQueryItems = (orderBy ? (Array.isArray(orderBy) ? orderBy : [orderBy]) : []).flatMap(
      (order) => Object.entries(order).map(([column, order]) => ({ column, order }))
    );

    const fullOrderQuery = orderQueryItems.length
      ? Prisma.sql`
        ORDER BY ${Prisma.join(
          orderQueryItems.map(
            (orderQueryItem) =>
              Prisma.sql`${getColumnQuery(orderQueryItem.column, NOTIFICATION_COLUMNS).sql} ${ORDER[orderQueryItem.order.toUpperCase()]}`
          ),
          ', '
        )}
      `
      : Prisma.empty;

    const whereQuery = parseFilterManually(NOTIFICATION_COLUMNS, filter);

    const res = await this.prisma.$queryRaw<any>`
      SELECT
        "notifications".*, "read"
      FROM
        "notificationmembers"
        LEFT JOIN "notifications" ON "notificationmembers"."notificationId" = "notifications"."id"
      ${whereQuery}
      ${fullOrderQuery}
      LIMIT ${parsePage.take}
      OFFSET ${parsePage.skip}
    `;

    return res;
  }

  async getNotificationsCountByMemberID({ filter }: NotificationMemberQueryArgs): Promise<number> {
    const whereQuery = parseFilterManually(NOTIFICATION_COLUMNS, filter);

    return this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT
        count("notifications".*) AS "count"
      FROM
        "notificationmembers"
        LEFT JOIN "notifications" ON "notificationmembers"."notificationId" = "notifications"."id"
      ${whereQuery}
    `.then((res) => Number(res[0].count));
  }

  async setReadNotification(notificationId: string, memberId: string): Promise<void> {
    await this.prisma.notificationMember.update({
      where: {
        memberId_notificationId: {
          memberId,
          notificationId,
        },
      },
      data: {
        read: true,
      },
    });
  }

  async getNotificationById(id: string) {
    return this.prisma.notification.findUnique({
      where: {
        id,
      },
    });
  }

  async createPackage(data: CreateNotificationInput) {
    return await this.prisma.notification.create({
      data,
    });
  }

  async updateNotification(data: UpdateNotificationInput) {
    return this.prisma.notification.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async removePackage(data: IDInput) {
    return this.prisma.notification.delete({
      where: {
        id: data.id,
      },
    });
  }
}
