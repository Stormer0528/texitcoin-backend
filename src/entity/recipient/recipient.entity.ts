import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { Email } from '../email/email.entity';

@ObjectType()
export class Recipient extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  emailId: string;

  @Field(() => ID)
  recipientId: string;

  @Field()
  isRead: boolean;

  @Field()
  isDeleted: boolean;

  @Field()
  isStarred: boolean;

  @Field(() => Email)
  email?: Email;

  @Field(() => Member)
  recipient?: Member;
}
