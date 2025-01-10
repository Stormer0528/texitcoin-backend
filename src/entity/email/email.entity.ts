import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { Recipient } from '../recipient/recipient.entity';
import { PFile } from '../file/file.entity';

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

  @Field(() => Member, { nullable: true })
  sender?: Member;

  @Field(() => [Recipient], { nullable: true })
  recipients?: Recipient[];

  @Field(() => [PFile], { nullable: true })
  files?: PFile[];
}
