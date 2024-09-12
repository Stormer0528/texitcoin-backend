import { InputType, Field, ObjectType } from 'type-graphql';

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
