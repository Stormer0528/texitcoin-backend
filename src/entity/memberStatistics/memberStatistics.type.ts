import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { PaginatedResponse } from '@/graphql/paginatedResponse';
import { QueryArgsBase } from '@/graphql/queryArgs';

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
  totalHashPower: number;

  @Field()
  totalTXCShared: number;

  @Field()
  joinDate: Date;
}

@InputType()
export class MemberDailyRewardsInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  startDate?: string;

  @Field({ nullable: true })
  endDate?: string;
}

@ObjectType()
export class MemberDailyReward {
  @Field()
  issuedAt: Date;

  @Field()
  txcShared: number;

  @Field()
  hashPower: number;
}
