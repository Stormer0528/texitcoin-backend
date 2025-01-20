import { QueryOrderPagination } from '@/graphql/queryArgs';
import { InputType, Field, ArgsType, Int } from 'type-graphql';
import dayjs from 'dayjs';
import { IsEmail } from 'class-validator';

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

@InputType()
export class ProfitabilityCalculationInput {
  @Field()
  joinDate: Date;

  @Field(() => Int)
  target: number;

  @Field(() => Int)
  init: number;
}

@InputType()
export class ContactToAdmin {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  name: string;

  @Field()
  message: string;
}
