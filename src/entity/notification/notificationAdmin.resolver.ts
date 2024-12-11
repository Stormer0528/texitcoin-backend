import { Service } from 'typedi';
import {
  Args,
  Resolver,
  Query,
  Info,
  Authorized,
  FieldResolver,
  Int,
  Ctx,
  Root,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import {
  NotificationAdminResponse,
  NotificationMemberResponse,
  NotificationQueryArgs,
} from './notification.type';
import { Notification, NotificationAdmin, NotificationMember } from './notification.entity';
import { NotificationService } from './notification.service';
import { Context } from '@/context';

@Service()
@Resolver(() => NotificationAdmin)
export class NotificationAdminResolver {
  constructor(private readonly service: NotificationService) {}

  @Authorized()
  @Query(() => NotificationAdminResponse)
  async notificationAdmins(
    @Args() query: NotificationQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<NotificationAdminResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; notifications?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getNotificationsCount(query);
    }

    if ('notifications' in fields) {
      promises.notifications = this.service.getNotifications(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; notifications?: Notification[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @FieldResolver(() => Int)
  async totalMembers(
    @Root() notification: NotificationAdmin,
    @Ctx() ctx: Context
  ): Promise<number> {
    return ctx.dataLoader.get('totalMembersForNotificationLoader').load(notification.id);
  }

  @FieldResolver(() => Int)
  async readMembers(@Root() notification: NotificationAdmin, @Ctx() ctx: Context): Promise<number> {
    return ctx.dataLoader.get('readMembersForNotificationLoader').load(notification.id);
  }
}
