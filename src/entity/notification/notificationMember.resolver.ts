import { Service } from 'typedi';
import { Args, Resolver, Query, Info, Authorized, Mutation, Arg, Ctx } from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import {
  NotificationMemberQueryArgs,
  NotificationMemberResponse,
  NotificationQueryArgs,
} from './notification.type';
import { Notification, NotificationMember } from './notification.entity';
import { NotificationService } from './notification.service';
import { IDInput, SuccessResponse } from '@/graphql/common.type';
import { SuccessResult } from '@/graphql/enum';
import { Context } from '@/context';
import { UserRole } from '@/type';

@Service()
@Resolver(() => NotificationMember)
export class NotificationMemberResolver {
  constructor(private readonly service: NotificationService) {}

  @Authorized([UserRole.OnlyMember])
  @Query(() => NotificationMemberResponse)
  async notificationMembers(
    @Args() query: NotificationMemberQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<NotificationMemberResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; notifications?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getNotificationsCountByMemberID(query);
    }

    if ('notifications' in fields) {
      promises.notifications = this.service.getNotificationsByMemberID(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; notifications?: NotificationMember[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.OnlyMember])
  @Mutation(() => SuccessResponse)
  async setReadNotification(
    @Ctx() ctx: Context,
    @Arg('data') data: IDInput
  ): Promise<SuccessResponse> {
    await this.service.setReadNotification(data.id, ctx.user.id);
    return {
      result: SuccessResult.success,
    };
  }
}
