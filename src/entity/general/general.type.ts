import { QueryOrderPagination } from '@/graphql/queryArgs';
import { InputType, Field, ArgsType } from 'type-graphql';
import dayjs from 'dayjs';

@InputType()
export class LiveStatsArgs {
  @Field()
  pastDays: number;
}

export type BLOCKSTATETYPE = 'day' | 'week' | 'month' | 'block';

@InputType()
export class BlockStatsArgs {
  @Field()
  type: BLOCKSTATETYPE;
}

@ArgsType()
export class CommissionOverviewQueryArgs extends QueryOrderPagination {
  @Field({ nullable: true, defaultValue: new Date() })
  weekStartDate?: Date;
}
