import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { WeeklyCommission } from './weeklycommission.entity';

// WeeklyCommission Query Args
@ArgsType()
export class WeeklyCommissionQueryArgs extends QueryArgsBase<Prisma.WeeklyCommissionWhereInput> {}

// WeeklyCommission list response with pagination ( total )
@ObjectType()
export class WeeklyCommissionResponse extends PaginatedResponse {
  @Field(() => [WeeklyCommission], { nullable: 'itemsAndList' })
  weeklyCommissions?: WeeklyCommission[];
}
