import type { Prisma, UserRole } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';
import { Notification, NotificationClient } from './notification.entity';
import { NotificationLevel } from '@/graphql/enum';

// Notification Query Args
@ArgsType()
export class NotificationQueryArgs extends QueryArgsBase<Prisma.NotificationWhereInput> {}

@ArgsType()
export class NotificationClientQueryArgs extends QueryArgsBase<Prisma.NotificationClientWhereInput> {}

// Notification list response with pagination ( total )
@ObjectType()
export class NotificationResponse extends PaginatedResponse {
  @Field(() => [NotificationClient], { nullable: true })
  notifications?: NotificationClient[];
}

// Create Notification Input and Response
@InputType()
export class CreateNotificationInput {
  @Field()
  message: string;

  @Field(() => NotificationLevel)
  level: NOTIFICATION_LEVEL;
}

@InputType()
export class UpdateNotificationInput {
  @Field(() => ID)
  id: string;

  @Field(() => NotificationLevel)
  level: NOTIFICATION_LEVEL;
}

export interface NewNotificationInterface {
  clients: NotificationClientIdentifier[];
  notification: Notification;
}

export type NOTIFICATION_LEVEL = 'ALL' | 'INDIVIDUAL' | 'TEAMLEADER';

export class NotificationClientIdentifier {
  clientId: string;
  clientType: UserRole;
}
