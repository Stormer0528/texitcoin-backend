import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';
import { Notification, NotificationAdmin, NotificationMember } from './notification.entity';
import { NotificationLevel } from '@/graphql/enum';

// Notification Query Args
@ArgsType()
export class NotificationQueryArgs extends QueryArgsBase<Prisma.NotificationWhereInput> {}

@ArgsType()
export class NotificationMemberQueryArgs extends QueryArgsBase<Prisma.NotificationMemberWhereInput> {}

// Notification list response with pagination ( total )
@ObjectType()
export class NotificationMemberResponse extends PaginatedResponse {
  @Field(() => [NotificationMember], { nullable: true })
  notifications?: NotificationMember[];
}

@ObjectType()
export class NotificationAdminResponse extends PaginatedResponse {
  @Field(() => [NotificationAdmin], { nullable: true })
  notifications?: NotificationAdmin[];
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
  memberIds: string[];
  notification: Notification;
}

export type NOTIFICATION_LEVEL = 'ALL' | 'INDIVIDUAL' | 'TEAMLEADER';
