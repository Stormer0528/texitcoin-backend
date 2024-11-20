import { ObjectType, Field, ID, Authorized, Int } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { Package } from '../package/package.entity';
import { PFile } from '../file/file.entity';
import { StatisticsSale } from '../statisticsSale/statisticsSale.entity';
import { UserRole } from '@/type';
import { RefLink } from '../referenceLink/referenceLink.entity';

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

  @Authorized([UserRole.Admin])
  @Field(() => [PFile], { nullable: 'itemsAndList' })
  paymentConfirm?: PFile[];

  @Authorized([UserRole.Admin])
  @Field({ nullable: true })
  note?: string;

  @Field(() => [StatisticsSale], { nullable: 'itemsAndList' })
  statisticsSales?: StatisticsSale[];

  @Authorized([UserRole.Admin])
  @Field(() => [RefLink], { nullable: 'itemsAndList' })
  reflinks?: RefLink[];
}
