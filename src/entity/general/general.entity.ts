import { ObjectType, Field, Int, InputType } from 'type-graphql';
import { BLOCKSTATETYPE } from './general.type';
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
