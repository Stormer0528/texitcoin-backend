import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { WeeklyCommissionStatus } from '../weeklycommissionstatus/weeklyCommissionStatus.entity';
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
  leftPoint: number;

  @Field()
  rightPoint: number;

  @Field()
  calculatedLeftPoint: number;

  @Field()
  calculatedRightPoint: number;

  @Field()
  commission: number;

  @Field(() => Confirmation4Status)
  status: CONFIRMATION4STATUS;

  @Field(() => Member, { nullable: true })
  member?: Member;

  @Field(() => WeeklyCommissionStatus, { nullable: true })
  weeklyCommissionStatus?: WeeklyCommissionStatus;
}
