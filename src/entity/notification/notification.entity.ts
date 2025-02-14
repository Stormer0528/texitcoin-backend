import { ObjectType, Field, ID, Int, Authorized } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { NotificationLevel } from '@/graphql/enum';
import { NOTIFICATION_LEVEL } from './notification.type';
import { Member } from '../member/member.entity';
import { UserRole } from '@prisma/client';

@ObjectType()
export class Notification extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  message: string;

  @Field(() => NotificationLevel)
  level: NOTIFICATION_LEVEL;
}

@ObjectType()
export class NotificationClient extends Notification {
  @Authorized([UserRole.ADMIN])
  @Field(() => Int)
  totalMembers?: number;

  @Authorized([UserRole.ADMIN])
  @Field(() => Int)
  readMembers?: number;

  @Authorized([UserRole.ADMIN])
  @Field(() => [Member])
  members?: Member[];

  @Field()
  read: boolean;
}
