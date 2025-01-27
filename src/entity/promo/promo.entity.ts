import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { GraphQLDate } from 'graphql-scalars';

@ObjectType()
export class Promo extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  code: string;

  @Field()
  description: string;

  @Field()
  status: boolean;

  @Field(() => GraphQLDate)
  startDate: Date;

  @Field(() => GraphQLDate)
  endDate: Date;
}
