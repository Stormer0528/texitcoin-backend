import { Service } from 'typedi';
import {
  Arg,
  Args,
  Authorized,
  Ctx,
  FieldResolver,
  Info,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from 'type-graphql';
import { Context } from '@/context';
import { UserRole } from '@/type';
import { NotificationClient } from './notification.entity';
import {
  NewNotificationInterface,
  NotificationClientQueryArgs,
  NotificationResponse,
} from './notification.type';
import { GraphQLResolveInfo } from 'graphql';
import graphqlFields from 'graphql-fields';
import { IDInput, ManySuccessResponse, SuccessResponse } from '@/graphql/common.type';
import { NotificationService } from './notification.service';
import { SuccessResult } from '@/graphql/enum';
import { Member } from '../member/member.entity';

@Service()
@Resolver(() => NotificationClient)
export class NotificationClientResolver {
  constructor(private readonly service: NotificationService) {}

  @FieldResolver(() => Int)
  async totalMembers(
    @Root() notification: NotificationClient,
    @Ctx() ctx: Context
  ): Promise<number> {
    return ctx.dataLoader.get('totalMembersForNotificationLoader').load(notification.id);
  }

  @FieldResolver(() => Int)
  async readMembers(
    @Root() notification: NotificationClient,
    @Ctx() ctx: Context
  ): Promise<number> {
    return ctx.dataLoader.get('readMembersForNotificationLoader').load(notification.id);
  }

  @Authorized([UserRole.ADMIN])
  @FieldResolver(() => [Member])
  async members(@Root() notification: NotificationClient, @Ctx() ctx: Context): Promise<Member[]> {
    return ctx.dataLoader.get('membersForNotificationLoader').load(notification.id);
  }

  @Authorized()
  @Query(() => NotificationResponse)
  async notifications(
    @Args() query: NotificationClientQueryArgs,
    @Info() info: GraphQLResolveInfo,
    @Ctx() ctx: Context
  ): Promise<NotificationResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; notifications?: any } = {};

    query.filter = {
      AND: [
        query.filter ? query.filter : {},
        {
          clientId: ctx.user.id,
          clientType: ctx.isAdmin ? UserRole.ADMIN : UserRole.MEMBER,
        },
      ],
    };

    if ('total' in fields) {
      promises.total = this.service.getNotificationsCountByClient(query);
    }

    if ('notifications' in fields) {
      promises.notifications = this.service.getNotificationsByClient(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; notifications?: NotificationClient[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized()
  @Mutation(() => SuccessResponse)
  async setReadNotification(
    @Ctx() ctx: Context,
    @Arg('data') data: IDInput
  ): Promise<SuccessResponse> {
    await this.service.setReadNotificationByClient(
      data.id,
      ctx.user.id,
      ctx.isAdmin ? UserRole.ADMIN : UserRole.MEMBER
    );
    return {
      result: SuccessResult.success,
    };
  }

  @Authorized()
  @Mutation(() => ManySuccessResponse)
  async setReadAllNotifications(@Ctx() ctx: Context): Promise<ManySuccessResponse> {
    return this.service.setReadAllNotificationsByClient(
      ctx.user.id,
      ctx.isAdmin ? UserRole.ADMIN : UserRole.MEMBER
    );
  }
}
