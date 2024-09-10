import { Prisma } from '@prisma/client';
import { ObjectType, Field, ArgsType } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';
import { DailyBlock } from './dailyblock.entity';

// DailyBlock Query Args
@ArgsType()
export class DailyBlockQueryArgs extends QueryArgsBase<Prisma.DailyBlockWhereInput> {}

// DailyBlock list response with pagination ( total )
@ObjectType()
export class DailyBlocksResponse extends PaginatedResponse {
  @Field(() => [DailyBlock], { nullable: 'itemsAndList' })
  blocks?: DailyBlock[];
}
