import { QueryArgsBase, QueryOrderPagination } from '@/graphql/queryArgs';
import { InputType, Field, ArgsType, Int } from 'type-graphql';
import dayjs from 'dayjs';
import { IsEmail } from 'class-validator';
import { Prisma } from '@prisma/client';

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
export type MemberInOutRevenueWhereInput = {
  AND?: MemberInOutRevenueWhereInput | MemberInOutRevenueWhereInput[];
  OR?: MemberInOutRevenueWhereInput[];
  NOT?: MemberInOutRevenueWhereInput | MemberInOutRevenueWhereInput[];
  id?: Prisma.StringFilter | string;
  amount?: Prisma.IntFilter | number | null;
  commission?: Prisma.IntFilter | number | null;
  percent?: Prisma.FloatFilter | number | null;
};
@ArgsType()
export class MemberInOutRevenueQueryArgs extends QueryArgsBase<Prisma.MemberWhereInput> {}
