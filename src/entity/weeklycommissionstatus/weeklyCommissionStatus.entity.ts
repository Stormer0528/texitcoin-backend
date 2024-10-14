import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { WeeklyCommission } from '../weeklycommission/weeklycommission.entity';

@ObjectType()
export class WeeklyCommissionStatus extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  weeklyCommissionId: string;

  @Field()
  beforeLeftPoint: number;

  @Field()
  beforeRightPoint: number;

  @Field()
  afterLeftPoint: number;

  @Field()
  afterRightPoint: number;

  @Field()
  memberId: string;

  @Field()
  weekStartDate: Date;

  @Field(() => WeeklyCommission, { nullable: true })
  weeklyCommission?: WeeklyCommission;

  @Field(() => Member, { nullable: true })
  member?: Member;
}
