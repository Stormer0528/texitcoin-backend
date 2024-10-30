import { ObjectType, Field, ID, Authorized } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { Package } from '../package/package.entity';
import { StatisticsSale } from '../statisticsSale/statisticsSale.entity';
import { UserRole } from '@/type';

@ObjectType()
export class Sale extends BaseEntity {
  @Field(() => ID)
  id: string;

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

  @Authorized([UserRole.Admin])
  @Field(() => [String])
  paymentConfirm: string[];

  @Field(() => [StatisticsSale], { nullable: 'itemsAndList' })
  statisticsSales?: StatisticsSale[];
}
