import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { Statistics } from '@/entity/statistics/statistics.entity';
import { BaseEntity } from '@/graphql/baseEntity';

// Statistics Query Args
@ArgsType()
export class StatisticsQueryArgs extends QueryArgsBase<Prisma.StatisticsWhereInput> {}

// Statistics list response with pagination ( total )
@ObjectType()
export class StatisticsResponse extends PaginatedResponse {
  @Field(() => [Statistics], { nullable: 'itemsAndList' })
  statistics?: Statistics[];
}

@InputType()
export class CreateStatisticsMemberStatisticsInput {
  @Field(() => ID)
  memberId: string;

  @Field()
  txcShared: number;

  @Field()
  hashPower: number;

  @Field()
  percent: number;
}

// Create Statistics Input and Response
@InputType()
export class CreateStatisticsInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field(() => [ID])
  saleIds: string[];

  @Field()
  totalHashPower: number;

  @Field()
  txcShared: number;

  @Field()
  totalMembers: number;

  @Field(() => [CreateStatisticsMemberStatisticsInput])
  memberStatistics: CreateStatisticsMemberStatisticsInput[];

  @Field()
  issuedAt: Date;

  @Field({ nullable: true })
  status: boolean = false;
}

@InputType()
export class ConfirmStatistics {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  transactionId: string;
}

@ObjectType()
export class PendingStatistics {
  @Field()
  wallet: string;
  @Field()
  txcShared: number;
}

@ObjectType()
export class PendingStatisticsResponse {
  @Field(() => [PendingStatistics])
  results: PendingStatistics[];
}

@InputType()
export class UpdateStatisticsInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  txcShared?: number;

  @Field({ nullable: true })
  status?: boolean;

  @Field(() => ID, { nullable: true })
  transactionId?: string;
}

@ObjectType()
export class LatestStatistics {
  @Field(() => ID)
  id: string;

  @Field()
  newBlocks: number;

  @Field()
  totalMembers: number;

  @Field()
  txcShared: number;

  @Field()
  issuedAt: Date;
}
