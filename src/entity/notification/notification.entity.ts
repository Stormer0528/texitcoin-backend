import { ObjectType, Field, ID, Int } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { NotificationLevel } from '@/graphql/enum';
import { NOTIFICATION_LEVEL } from './notification.type';
import { Member } from '../member/member.entity';

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
export class NotificationMember extends Notification {
  @Field()
  read: boolean;
}

@ObjectType()
export class NotificationAdmin extends Notification {
  @Field(() => Int)
  totalMembers?: number;

  @Field(() => Int)
  readMembers?: number;

  @Field(() => [Member], { nullable: true })
  members?: Member[];
}
