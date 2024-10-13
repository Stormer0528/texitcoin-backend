import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { WeeklyCommission } from './weeklycommission.entity';
import { Confirmation4Status } from '@/graphql/enum';

// WeeklyCommission Query Args
@ArgsType()
export class WeeklyCommissionQueryArgs extends QueryArgsBase<Prisma.WeeklyCommissionWhereInput> {}

// WeeklyCommission list response with pagination ( total )
@ObjectType()
export class WeeklyCommissionResponse extends PaginatedResponse {
  @Field(() => [WeeklyCommission], { nullable: 'itemsAndList' })
  weeklyCommissions?: WeeklyCommission[];
}

@InputType()
export class WeeklyCommissionUpdateInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  calculatedLeftPoint?: number;

  @Field({ nullable: true })
  calculatedRightPoint?: number;

  @Field({ nullable: true })
  commission?: number;

  @Field(() => Confirmation4Status, { nullable: true })
  status?: Confirmation4Status;
}

export type CONFIRMATION4STATUS = 'NONE' | 'PENDING' | 'CONFIRM' | 'BLOCK';
