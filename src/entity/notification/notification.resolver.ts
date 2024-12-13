import { Resolver, Root, Subscription } from 'type-graphql';
import { Notification } from './notification.entity';
import { Context } from '@/context';
import { NewNotificationInterface } from './notification.type';
import { ROUTING_NEW_NOTIFICATION } from '@/consts/subscription';
import { Service } from 'typedi';

@Service()
@Resolver(() => Notification)
export class NotificationResolver {
  constructor() {}

  @Subscription(() => Notification, {
    topics: ROUTING_NEW_NOTIFICATION,
    filter: ({ payload, context }: { payload: NewNotificationInterface; context: Context }) => {
      if (payload.notification.level === 'ALL' || context.isAdmin) return true;
      return payload.memberIds.findIndex((mId) => mId === context.user.id) !== -1;
    },
  })
  newNotification(@Root() root: NewNotificationInterface): Notification {
    return root.notification;
  }
}
