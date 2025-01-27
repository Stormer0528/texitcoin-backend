import { ObjectType, Field, ID, Authorized, Int } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { Package } from '../package/package.entity';
import { StatisticsSale } from '../statisticsSale/statisticsSale.entity';
import { UserRole } from '@/type';
import { Proof } from '../proof/proof.entity';

@ObjectType()
export class Sale extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  ID: number;

  @Field()
  paymentMethod: string;

  @Field()
  status: boolean;

  @Field(() => ID)
  memberId: string;

  @Field(() => Member, { nullable: true })
  member?: Member;

  @Field(() => ID)
  packageId: string;

  @Field(() => Package, { nullable: true })
  package?: Package;

  @Field()
  orderedAt: Date;

  @Field()
  sponsorCnt: number;

  @Field(() => ID, { nullable: true })
  toMemberId?: string;

  @Field()
  isMetal: boolean;

  @Field(() => Member, { nullable: true })
  toMember?: Member;

  @Field(() => [StatisticsSale], { nullable: true })
  statisticsSales?: StatisticsSale[];

  @Authorized([UserRole.ADMIN])
  @Field(() => Proof, { nullable: true })
  proof?: Proof;
}
