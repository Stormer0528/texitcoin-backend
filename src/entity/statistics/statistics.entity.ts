import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { MemberStatistics } from '../memberStatistics/memberStatistics.entity';
import { StatisticsSale } from '../statisticsSale/statisticsSale.entity';

@ObjectType()
export class Statistics extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  newBlocks: number;

  @Field()
  totalBlocks: number;

  @Field()
  totalHashPower: number;

  @Field()
  totalMembers?: number;

  @Field()
  status: boolean = false;

  @Field()
  txcShared: bigint;

  @Field()
  issuedAt: Date;

  @Field()
  from: Date;

  @Field()
  to: Date;

  @Field(() => ID, { nullable: true })
  transactionId: string;

  @Field(() => [MemberStatistics], { nullable: 'itemsAndList' })
  memberStatistics?: MemberStatistics[];

  @Field(() => [StatisticsSale], { nullable: 'itemsAndList' })
  statisticsSales?: StatisticsSale[];
}
