import type { Prisma } from '@prisma/client';
import { ObjectType, Field, ArgsType, InputType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { Recipient } from './recipient.entity';
import { Email } from '../email/email.entity';

// Recipient Query Args
@ArgsType()
export class RecipientQueryArgs extends QueryArgsBase<Prisma.RecipientWhereInput> {}

// Recipient list response with pagination ( total )
@ObjectType()
export class RecipientResponse extends PaginatedResponse {
  @Field(() => [Recipient], { nullable: true })
  recipients?: Recipient[];
}

@InputType()
export class EmailStatusInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  isStarred: boolean;

  @Field({ nullable: true })
  isRead: boolean;

  @Field({ nullable: true })
  isDeleted: boolean;
}

export interface NewEmailInterface {
  email: Email;
  recipientIds: string[];
}
