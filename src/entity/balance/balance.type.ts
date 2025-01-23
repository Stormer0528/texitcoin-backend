import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';
import { Balance } from './balance.entity';
import { GraphQLInt } from 'graphql';

// Balance Query Args
@ArgsType()
export class BalanceQueryArgs extends QueryArgsBase<Prisma.BalanceWhereInput> {}

// Balance list response with pagination ( total )
@ObjectType()
export class BalanceResponse extends PaginatedResponse {
  @Field(() => [Balance], { nullable: true })
  balances?: Balance[];
}

// Create Balance Input and Response
@InputType()
export class AddBalanceInput {
  @Field()
  date: Date;

  @Field()
  type: BALANCE_TYPE;

  @Field({ nullable: true })
  note: string;

  @Field(() => GraphQLInt)
  amountInCents: number;

  @Field()
  memberId: string;

  @Field({ nullable: true })
  extra1?: string;

  @Field({ nullable: true })
  extra2?: string;
}

// Create Balance Input and Response
@InputType()
export class UpdateBalanceInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  date?: Date;

  @Field({ nullable: true })
  type?: BALANCE_TYPE;

  @Field({ nullable: true })
  note?: string;

  @Field(() => GraphQLInt, { nullable: true })
  amountInCents?: number;

  @Field({ nullable: true })
  memberId?: string;
}

export type BALANCE_TYPE = 'Commission' | 'Payment' | '3rd Party Payment';
