import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';
import { Confirmation3Status } from '@/graphql/enum';

import { Member } from '../member/member.entity';
import { CONFIRMATION3STATUS } from './weeklycommission.type';

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

  @Field(() => Confirmation3Status)
  status: CONFIRMATION3STATUS;

  @Field(() => Member, { nullable: true })
  member?: Member;
}
