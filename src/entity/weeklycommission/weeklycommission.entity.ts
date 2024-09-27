import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';

@ObjectType()
export class WeeklyCommission extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  memberId: string;

  @Field()
  weekStartDate: Date;

  @Field()
  leftPoint: number;

  @Field()
  rightPoint: number;

  @Field()
  calculatedLeftPoint: number;

  @Field()
  calculatedRightPoint: number;

  @Field()
  commission: number;

  @Field(() => Member)
  member: Member;
}
