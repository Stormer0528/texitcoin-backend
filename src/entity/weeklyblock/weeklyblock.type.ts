import { Prisma } from '@prisma/client';
import { ObjectType, Field, ArgsType } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';
import { WeeklyBlock } from './weeklyblock.entity';

// WeeklyBlock Query Args
@ArgsType()
export class WeeklyBlockQueryArgs extends QueryArgsBase<Prisma.WeeklyBlockWhereInput> {}

// WeeklyBlock list response with pagination ( total )
@ObjectType()
export class WeeklyBlocksResponse extends PaginatedResponse {
  @Field(() => [WeeklyBlock], { nullable: 'itemsAndList' })
  weeklyblocks?: WeeklyBlock[];
}
