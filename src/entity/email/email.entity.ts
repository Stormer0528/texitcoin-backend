import { ObjectType, Field, ID, UseMiddleware } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { Recipient } from '../recipient/recipient.entity';
import { PFile } from '../file/file.entity';
import { emailAccess } from '@/graphql/middlewares';

@ObjectType()
export class Email extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  senderId: string;

  @Field()
  to: string;

  @Field()
  subject: string;

  @Field()
  body: string;

  @Field()
  isDraft: boolean;

  @Field()
  isDeleted: boolean;

  @Field({ nullable: true })
  replyFromId?: string;

  @Field(() => Member, { nullable: true })
  sender?: Member;

  @UseMiddleware(emailAccess())
  @Field(() => [Recipient], { nullable: true })
  recipients?: Recipient[];

  @Field(() => Email, { nullable: true })
  replyFrom?: Email;

  @Field(() => [Email], { nullable: true })
  repliedEmails?: Email[];

  @Field(() => [PFile], { nullable: true })
  files?: PFile[];
}
