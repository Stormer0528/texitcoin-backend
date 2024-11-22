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
  commissionId: string;

  @Field({ nullable: true })
  txType?: string;

  @Field(() => ID, { nullable: true })
  txId?: string;

  @Field()
  orderedAt: Date;

  @Field(() => [ID], { nullable: 'itemsAndList' })
  fileIds?: string[];

  @Field({ nullable: true })
  note?: string;

  @Field(() => [LinkInput], { nullable: 'itemsAndList' })
  reflinks?: LinkInput[];
}

// Update PrepaidCommission Input and Response
@InputType()
export class UpdatePrepaidCommissionInput {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  commissionId?: string;

  @Field({ nullable: true })
  txType?: string;

  @Field(() => ID, { nullable: true })
  txId?: string;

  @Field({ nullable: true })
  orderedAt?: Date;

  @Field(() => [ID], { nullable: 'itemsAndList' })
  fileIds?: string[];

  @Field({ nullable: true })
  note?: string;

  @Field(() => [LinkInput], { nullable: 'itemsAndList' })
  reflinks?: LinkInput[];
}
