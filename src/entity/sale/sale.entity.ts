import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { Package } from '../package/package.entity';
import { StatisticsSale } from '../statisticsSale/statisticsSale.entity';

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

  @Field({ nullable: true })
  paymentConfirm?: string;

  @Field(() => [StatisticsSale], { nullable: 'itemsAndList' })
  statisticsSales?: StatisticsSale[];
}
