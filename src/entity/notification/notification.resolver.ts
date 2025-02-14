import { Service } from 'typedi';
import { Resolver, Root, Subscription } from 'type-graphql';
import { ROUTING_NEW_NOTIFICATION } from '@/consts/subscription';
import { Context } from '@/context';
import { UserRole } from '@/type';
import { Notification } from './notification.entity';
import { NewNotificationInterface } from './notification.type';

@Service()
@Resolver(() => Notification)
export class NotificationResolver {
  constructor() {}

  @Subscription(() => Notification, {
    topics: ROUTING_NEW_NOTIFICATION,
    filter: ({ payload, context }: { payload: NewNotificationInterface; context: Context }) => {
      return (
        payload.clients.findIndex(
          (client) =>
            client.clientId === context.user.id &&
            client.clientType === (context.isAdmin ? UserRole.ADMIN : UserRole.MEMBER)
        ) !== -1
      );
    },
  })
  newNotification(@Root() root: NewNotificationInterface): Notification {
    return root.notification;
  }
}
