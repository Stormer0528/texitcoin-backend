import { Prisma } from '@prisma/client';
import { ObjectType, Field, ArgsType } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';
import { MonthlyBlock } from './monthlyblock.entity';

// MonthlyBlock Query Args
@ArgsType()
export class MonthlyBlockQueryArgs extends QueryArgsBase<Prisma.MonthlyBlockWhereInput> {}

// MonthlyBlock list response with pagination ( total )
@ObjectType()
export class MonthlyBlocksResponse extends PaginatedResponse {
  @Field(() => [MonthlyBlock], { nullable: 'itemsAndList' })
  blocks?: MonthlyBlock[];
}
