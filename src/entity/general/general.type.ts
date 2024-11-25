import { QueryOrderPagination } from '@/graphql/queryArgs';
import { InputType, Field, ArgsType } from 'type-graphql';
import dayjs from 'dayjs';

@InputType()
export class LiveStatsArgs {
  @Field()
  pastDays: number;
}

export type PERIODSTATETYPE = 'day' | 'week' | 'month' | 'block' | 'quarter';

@InputType()
export class PeriodStatsArgs {
  @Field()
  type: PERIODSTATETYPE;
}

@ArgsType()
export class CommissionOverviewQueryArgs extends QueryOrderPagination {
  @Field({ nullable: true, defaultValue: new Date() })
  weekStartDate?: Date;
}
