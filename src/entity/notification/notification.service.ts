import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import {
  NewNotificationInterface,
  NotificationClientIdentifier,
  NotificationClientQueryArgs,
  NotificationQueryArgs,
  UpdateNotificationInput,
} from './notification.type';
import { ColumnInterface } from '@/type';
import { Prisma, UserRole } from '@prisma/client';
import { getColumnQuery } from '@/utils/getColumnQuery';
import { ORDER } from '@/consts/db';
import { parseFilterManually } from '@/utils/parseFilterManually';
import { NotificationLevel } from '@/graphql/enum';

import { pubSub } from '@/pubsub';
import { ROUTING_NEW_NOTIFICATION } from '@/consts/subscription';

const NOTIFICATION_COLUMNS: ColumnInterface[] = [
  { column: 'notification.id', sql: Prisma.sql`"notifications"."id"` },
  { column: 'notification.message', sql: Prisma.sql`"notification"."message"` },
  { column: 'notification.level', sql: Prisma.sql`"notification"."level"` },
  { column: 'read', sql: Prisma.sql`"read"` },
  { column: 'clientId', sql: Prisma.sql`"clientId"` },
  { column: 'clientType', sql: Prisma.sql`"clientType"`, parsing: Prisma.sql`::Text` },
  { column: 'createdAt', sql: Prisma.sql`"createdAt"` },
];

@Service()
export class NotificationService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getNotificationsByClient(params: NotificationClientQueryArgs) {
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
        "notificationclients"
        LEFT JOIN "notifications" ON "notificationclients"."notificationId" = "notifications"."id"
      ${whereQuery}
      ${fullOrderQuery}
      LIMIT ${parsePage.take}
      OFFSET ${parsePage.skip}
    `;

    return res;
  }

  async getNotificationsCountByClient({ filter }: NotificationClientQueryArgs): Promise<number> {
    const whereQuery = parseFilterManually(NOTIFICATION_COLUMNS, filter);

    return this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT
        count("notifications".*) AS "count"
      FROM
        "notificationclients"
        LEFT JOIN "notifications" ON "notificationclients"."notificationId" = "notifications"."id"
      ${whereQuery}
    `.then((res) => Number(res[0].count));
  }

  async setReadNotificationByClient(
    notificationId: string,
    clientId: string,
    clientType: UserRole
  ): Promise<void> {
    await this.prisma.notificationClient.update({
      where: {
        clientId_clientType_notificationId: {
          clientId,
          clientType,
          notificationId,
        },
      },
      data: {
        read: true,
      },
    });
  }

  async setReadAllNotificationsByClient(clientId: string, clientType: UserRole) {
    return this.prisma.notificationClient.updateMany({
      where: {
        clientId,
        clientType,
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

  async updateNotification(data: UpdateNotificationInput) {
    return this.prisma.notification.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async addNotification(message: string, level: NotificationLevel, memberIds: string[]) {
    if (level === NotificationLevel.ALL) {
      const members = await this.prisma.member.findMany({
        where: {
          status: true,
        },
        select: {
          id: true,
        },
      });
      const adminIds = await this.prisma.admin.findMany({
        select: {
          id: true,
        },
      });

      await this._addNotification(message, level, [
        ...members.map((member) => ({ clientId: member.id, clientType: UserRole.MEMBER })),
        ...adminIds.map((admin) => ({ clientId: admin.id, clientType: UserRole.ADMIN })),
      ]);
    } else {
      const adminIds = await this.prisma.admin.findMany({
        select: {
          id: true,
        },
      });

      await this._addNotification(message, level, [
        ...memberIds.map((mID) => ({ clientId: mID, clientType: UserRole.MEMBER })),
        ...adminIds.map((admin) => ({ clientId: admin.id, clientType: UserRole.ADMIN })),
      ]);
    }
  }

  private async _addNotification(
    message: string,
    level: NotificationLevel,
    clients: NotificationClientIdentifier[]
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        message,
        level,
        notificationClients: {
          createMany: {
            data: clients,
          },
        },
      },
    });

    pubSub.publish(ROUTING_NEW_NOTIFICATION, {
      clients,
      notification,
    } as NewNotificationInterface);
  }
}
