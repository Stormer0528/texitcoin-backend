import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { Email } from './email.entity';
import { IsAlphanumeric, IsOptional } from 'class-validator';

// Email Query Args
@ArgsType()
export class EmailQueryArgs extends QueryArgsBase<Prisma.EmailWhereInput> {}

// Email list response with pagination ( total )
@ObjectType()
export class EmailResponse extends PaginatedResponse {
  @Field(() => [Email], { nullable: true })
  emails?: Email[];
}

// Create Email Input and Response
@InputType()
export class CreateEmailInput {
  @Field()
  to: string;

  @Field()
  subject: string;

  @Field()
  body: string;

  @Field(() => [ID], { nullable: true })
  fileIds?: string[];
}

@InputType()
export class UpdateEmailInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  to: string;

  @Field({ nullable: true })
  subject?: string;

  @Field({ nullable: true })
  body?: string;

  @Field(() => [ID], { nullable: true })
  fileIds?: string[];
}
