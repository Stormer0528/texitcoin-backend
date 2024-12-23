import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { GraphQLInt } from 'graphql';
import { Member } from '../member/member.entity';

@ObjectType()
export class Balance extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  date: Date;

  @Field()
  type: string;

  @Field()
  note: string;

  @Field(() => GraphQLInt)
  amountInCents: number;

  @Field()
  memberId: string;

  @Field(() => Member)
  member?: Member;
}
