import { ObjectType, Field, Int } from 'type-graphql';

@ObjectType()
export class DailyStats {
  @Field()
  field: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class EntityStats {
  @Field()
  total: number;

  @Field(() => [DailyStats])
  dailyData: DailyStats[];

  @Field({ nullable: true })
  meta?: number;
}
