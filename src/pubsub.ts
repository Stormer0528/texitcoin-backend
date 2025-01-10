import { createPubSub } from '@graphql-yoga/subscription';
import { ROUTING_NEW_EMAIL, ROUTING_NEW_NOTIFICATION } from './consts/subscription';
import { NewNotificationInterface } from './entity/notification/notification.type';
import { NewEmailInterface } from './entity/recipient/recipient.type';

export const pubSub = createPubSub<{
  [ROUTING_NEW_NOTIFICATION]: [NewNotificationInterface];
  [ROUTING_NEW_EMAIL]: [NewEmailInterface];
}>();
