import { QueryArgsBase } from '@/graphql/queryArgs';
import { InputType, Field, ArgsType } from 'type-graphql';
import { Prisma } from '@prisma/client';

@InputType()
export class LiveStatsArgs {
  @Field()
  pastDays: number;
}

export type BLOCKSTATETYPE = 'day' | 'week' | 'month' | 'block';

@InputType()
export class BlockStatsArgs {
  @Field()
  type: BLOCKSTATETYPE;
}
