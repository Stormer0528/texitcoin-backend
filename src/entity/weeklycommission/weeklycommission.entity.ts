import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { Confirmation4Status } from '@/graphql/enum';
import { CONFIRMATION4STATUS } from './weeklycommission.type';

@ObjectType()
export class WeeklyCommission extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  memberId: string;

  @Field()
  weekStartDate: Date;

  @Field()
  beforeLeftPoint: number;

  @Field()
  beforeRightPoint: number;

  @Field()
  afterLeftPoint: number;

  @Field()
  afterRightPoint: number;

  @Field()
  calculatedLeftPoint: number;

  @Field()
  calculatedRightPoint: number;

  @Field()
  commission: number;

  @Field(() => Confirmation4Status)
  status: CONFIRMATION4STATUS;

  @Field({ nullable: true })
  note?: string;

  @Field(() => Member, { nullable: true })
  member?: Member;
}
