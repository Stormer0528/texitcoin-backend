import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { Confirmation3Status } from '@/graphql/enum';
import { WeeklyCommissionStatus } from './weeklyCommissionStatus.entity';

// WeeklyCommissionStatus Query Args
@ArgsType()
export class WeeklyCommissionStatusQueryArgs extends QueryArgsBase<Prisma.WeeklyCommissionStatusWhereInput> {}

// WeeklyCommissionStatus list response with pagination ( total )
@ObjectType()
export class WeeklyCommissionStatusResponse extends PaginatedResponse {
  @Field(() => [WeeklyCommissionStatus], { nullable: 'itemsAndList' })
  weeklyCommissions?: WeeklyCommissionStatus[];
}

@InputType()
export class WeeklyCommissionStatusUpdateInput {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  weeklyCommissionId?: string;

  @Field({ nullable: true })
  leftPoint?: number;

  @Field({ nullable: true })
  rightPoint?: number;

  @Field({ nullable: true })
  memberId?: string;

  @Field({ nullable: true })
  weekStartDate: Date;
}
