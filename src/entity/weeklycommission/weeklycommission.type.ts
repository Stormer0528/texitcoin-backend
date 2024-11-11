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

  @Field(() => Confirmation4Status, { nullable: true })
  status?: Confirmation4Status;

  @Field({ nullable: true })
  note?: string;

  @Field(() => [ID], { nullable: 'itemsAndList' })
  fileIds?: string[];
}

export type CONFIRMATION4STATUS = 'NONE' | 'PENDING' | 'CONFIRM' | 'BLOCK';
