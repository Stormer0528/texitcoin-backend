import { ObjectType, Field, Int, ID } from 'type-graphql';
import { PaginatedResponse } from '@/graphql/paginatedResponse';
import { GraphQLInt } from 'graphql';

@ObjectType()
export class DailyStats {
  @Field()
  field: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class EntityStats {
  @Field()
  total: number;

  @Field(() => [DailyStats])
  dailyData: DailyStats[];

  @Field({ nullable: true })
  meta?: number;
}

@ObjectType()
export class BlockStatsResponse {
  @Field()
  hashRate: number;

  @Field()
  difficulty: number;

  @Field()
  base: string;

  @Field()
  soldHashPower: number;

  @Field({ nullable: true })
  baseDate?: Date;
}

@ObjectType()
export class MinerCountStatsResponse {
  @Field(() => Int)
  minerCount: number;

  @Field()
  base: string;

  @Field()
  baseDate: Date;
}

@ObjectType()
export class AverageMinerRewardStatsResponse {
  @Field()
  reward: number;

  @Field()
  base: string;

  @Field()
  baseDate: Date;
}

@ObjectType()
export class CommissionOverview {
  @Field()
  weekStartDate: Date;

  @Field(() => Int)
  totalSale: number;

  @Field(() => Int)
  totalRevenue: number;

  @Field(() => Int)
  totalMember: number;

  @Field(() => Int)
  totalAmount: number;
}

@ObjectType()
export class CommissionOverviewResponse extends PaginatedResponse {
  @Field(() => [CommissionOverview], { nullable: true })
  commissions?: CommissionOverview[];
}

@ObjectType()
export class RevenueOverviewResponse {
  @Field()
  revenue: number;

  @Field(() => [RevenueSpentItem], { nullable: true })
  spent?: RevenueSpentItem[];
}

@ObjectType()
export class CommissionPeriodResponse {
  @Field(() => Int)
  commission: number;

  @Field(() => Int)
  revenue: number;

  @Field()
  base: string;

  @Field()
  baseDate: Date;
}

@ObjectType()
export class HashPowerResponse {
  @Field()
  actualHashPower: number;

  @Field()
  soldHashPower: number;
}

@ObjectType()
export class TopRecruitersResponse {
  @Field()
  fullName: string;

  @Field()
  totalIntroducers: number;
}

@ObjectType()
export class TopEarnersResponse {
  @Field()
  fullName: string;

  @Field()
  earned: number;
}

@ObjectType()
export class RevenueSpentItem {
  @Field()
  label: string;

  @Field()
  value: number;
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

@ObjectType()
export class TXCSharedResponse {
  @Field()
  txc: number;

  @Field()
  base: string;

  @Field()
  baseDate: Date;
}

@ObjectType()
export class ProfitabilityCalculationResponse {
  @Field()
  startDate: Date;

  @Field(() => Int)
  target: number;

  @Field(() => Int)
  init: number;

  @Field(() => Int)
  period: number;

  @Field()
  txc: number;

  @Field()
  txcCost: number;

  @Field()
  extraTXC: number;

  @Field()
  endDate: Date;

  @Field()
  txcPrice: number;
}

@ObjectType()
export class MemberInOutRevenue {
  @Field()
  id: string;

  @Field()
  username: string;

  @Field()
  fullName: string;

  @Field(() => GraphQLInt)
  amount: number;

  @Field(() => GraphQLInt)
  commission: number;

  @Field({ nullable: true })
  percent: number;
}
@ObjectType()
export class MemberInOutRevenueResponse extends PaginatedResponse {
  @Field(() => [MemberInOutRevenue], { nullable: true })
  inOuts?: MemberInOutRevenue[];
}

@ObjectType()
export class BalancesByMember {
  @Field()
  id: string;

  @Field()
  username: string;

  @Field()
  fullName: string;

  @Field(() => Int)
  balance: number;
}

@ObjectType()
export class BalancesByMemberResponse extends PaginatedResponse {
  @Field(() => [BalancesByMember], { nullable: true })
  balances?: BalancesByMember[];
}
