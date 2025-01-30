import { ObjectType, Field, ID, Authorized, Int } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { ConfirmationStatus } from '@/graphql/enum';
import { CONFIRMATIONSTATUS } from './weeklycommission.type';
import { UserRole } from '@/type';
import { Proof } from '../proof/proof.entity';

@ObjectType()
export class WeeklyCommission extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  ID: number;

  @Field(() => ID)
  memberId: string;

  @Field()
  weekStartDate: Date;

  @Field()
  begL: number;

  @Field()
  begR: number;

  @Field()
  newL: number;

  @Field()
  newR: number;

  @Field()
  maxL: number;

  @Field()
  maxR: number;

  @Field()
  endL: number;

  @Field()
  endR: number;

  @Field()
  pkgL: number;

  @Field()
  pkgR: number;

  @Field()
  commission: number;

  @Field(() => Int)
  cash: number;

  @Field(() => Int)
  bogo: number;

  @Field({ nullable: true })
  shortNote?: string;

  @Field(() => ConfirmationStatus)
  status: CONFIRMATIONSTATUS;

  @Field(() => Member, { nullable: true })
  member?: Member;

  @Authorized([UserRole.ADMIN])
  @Field(() => Proof, { nullable: true })
  proof?: Proof;
}
