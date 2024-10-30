import { ObjectType, Field, ID, Authorized } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { Package } from '../package/package.entity';
import { File } from '../file/file.entity';
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

  @Field(() => [File], { nullable: 'itemsAndList' })
  paymentConfirm?: File[];

  @Field(() => [StatisticsSale], { nullable: 'itemsAndList' })
  statisticsSales?: StatisticsSale[];
}
