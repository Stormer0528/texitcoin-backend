import { ObjectType, Field, Int, InputType } from 'type-graphql';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

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
  @Field(() => [CommissionOverview], { nullable: 'itemsAndList' })
  commissions?: CommissionOverview[];
}

@ObjectType()
export class RevenueOverviewResponse {
  @Field()
  revenue: number;

  @Field()
  commissionPending: number;

  @Field()
  commissionApproved: number;

  @Field()
  commissionPaid: number;

  @Field()
  mineElectricy: number;

  @Field()
  mineFacility: number;

  @Field()
  mineMaintainance: number;

  @Field()
  mineNewEquipment: number;

  @Field()
  infrastructure: number;

  @Field()
  marketingMineTXCPromotion: number;

  @Field()
  marketingTXCPromotion: number;
}

@ObjectType()
export class CommissionPeriodResponse {
  @Field(() => Int)
  commission: number;

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
