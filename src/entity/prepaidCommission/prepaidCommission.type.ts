import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID, Int } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';
import { PrepaidCommission } from './prepaidCommission.entity';
import { LinkInput } from '../referenceLink/referenceLink.type';

// PrepaidCommission Query Args
@ArgsType()
export class PrepaidCommissionQueryArgs extends QueryArgsBase<Prisma.PrepaidCommissionWhereInput> {}

// PrepaidCommission list response with pagination ( total )
@ObjectType()
export class PrepaidCommissionResponse extends PaginatedResponse {
  @Field(() => [PrepaidCommission], { nullable: 'itemsAndList' })
  prepaidCommissions?: PrepaidCommission[];
}

// Create PrepaidCommission Input and Response
@InputType()
export class CreatePrepaidCommissionInput {
  @Field(() => ID)
  memberId: string;

  @Field({ nullable: true })
  txType?: string;

  @Field(() => ID, { nullable: true })
  txId?: string;

  @Field(() => Int)
  pkgL: number;

  @Field(() => Int)
  pkgR: number;

  @Field(() => Int)
  commission: number;

  @Field()
  orderedAt: Date;

  @Field()
  weekStartDate: Date;

  @Field(() => [ID], { nullable: 'itemsAndList' })
  fileIds?: string[];

  @Field({ nullable: true })
  note?: string;

  @Field(() => [LinkInput], { nullable: 'itemsAndList' })
  links?: LinkInput[];
}

// Update PrepaidCommission Input and Response
@InputType()
export class UpdatePrepaidCommissionInput {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  memberId?: string;

  @Field({ nullable: true })
  txType?: string;

  @Field(() => ID, { nullable: true })
  txId?: string;

  @Field(() => Int, { nullable: true })
  pkgL?: number;

  @Field(() => Int, { nullable: true })
  pkgR?: number;

  @Field(() => Int, { nullable: true })
  commission?: number;

  @Field({ nullable: true })
  orderedAt?: Date;

  @Field({ nullable: true })
  weekStartDate?: Date;

  @Field(() => [ID], { nullable: 'itemsAndList' })
  fileIds?: string[];

  @Field({ nullable: true })
  note?: string;

  @Field(() => [LinkInput], { nullable: 'itemsAndList' })
  links?: LinkInput[];
}
