import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID, Int } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { WeeklyCommission } from './weeklycommission.entity';
import { ConfirmationStatus } from '@/graphql/enum';
import { LinkInput } from '../referenceLink/referenceLink.type';

// WeeklyCommission Query Args
@ArgsType()
export class WeeklyCommissionQueryArgs extends QueryArgsBase<Prisma.WeeklyCommissionWhereInput> {}

// WeeklyCommission list response with pagination ( total )
@ObjectType()
export class WeeklyCommissionResponse extends PaginatedResponse {
  @Field(() => [WeeklyCommission], { nullable: true })
  weeklyCommissions?: WeeklyCommission[];
}

@InputType()
export class WeeklyCommissionUpdateInput {
  @Field(() => ID)
  id: string;

  @Field(() => ConfirmationStatus, { nullable: true })
  status?: ConfirmationStatus;

  @Field({ nullable: true })
  note?: string;

  @Field(() => [ID], { nullable: true })
  fileIds?: string[];

  @Field(() => [LinkInput], { nullable: true })
  reflinks?: LinkInput[];
}

@InputType()
export class WeeklyCommissionsStatusUpdateInput {
  @Field(() => [ID])
  ids: string[];

  @Field(() => ConfirmationStatus)
  status: ConfirmationStatus;
}

export type CONFIRMATIONSTATUS = 'NONE' | 'PENDING' | 'APPROVED' | 'PAID' | 'DECLINED' | 'PREVIEW';

@InputType()
export class WeeklyCommissionGetInput {
  @Field(() => ID)
  memberId: string;

  @Field()
  weekStartDate: Date;
}

@ObjectType()
export class CommissionStatus {
  @Field(() => Int)
  begL: number;

  @Field(() => Int)
  begR: number;

  @Field(() => Int)
  newL: number;

  @Field(() => Int)
  newR: number;
}
