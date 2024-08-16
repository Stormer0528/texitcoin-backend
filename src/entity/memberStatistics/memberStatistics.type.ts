import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { MemberStatistics } from '@/entity/memberStatistics/memberStatistics.entity';

// MemberStatistics Query Args
@ArgsType()
export class MemberStatisticsQueryArgs extends QueryArgsBase<Prisma.MemberStatisticsWhereInput> {}

// MemberStatistics list response with pagination ( total )
@ObjectType()
export class MemberStatisticsResponse extends PaginatedResponse {
  @Field(() => [MemberStatistics], { nullable: 'itemsAndList' })
  memberStatistics?: MemberStatistics[];
}

// Create UserStatistics Input and Response
@InputType()
export class CreateMemberStatisticsInput {
  @Field()
  memberId: string;

  @Field()
  statisticsId: string;

  @Field()
  txcShared: number;

  @Field()
  hashPower: number;

  @Field()
  percent: number;

  @Field()
  issuedAt: Date;
}

@InputType()
export class MemberOverviewInput {
  @Field(() => ID)
  id: string;
}

@ObjectType()
export class MemberOverview {
  @Field()
  lastHashPower: number;

  @Field()
  totalTXCShared: bigint;

  @Field()
  joinDate: Date;
}

// Create Multil UserStatistics Input and Response
@InputType()
export class CreateManyMemberStatisticsInput {
  @Field(() => [CreateMemberStatisticsInput])
  memberStatistics: CreateMemberStatisticsInput[];
}
