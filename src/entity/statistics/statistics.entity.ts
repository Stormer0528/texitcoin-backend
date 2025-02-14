import { ObjectType, Field, ID, Authorized } from 'type-graphql';

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

  @Authorized()
  @Field(() => ID, { nullable: true })
  transactionId: string;

  @Authorized()
  @Field(() => [MemberStatistics], { nullable: true })
  memberStatistics?: MemberStatistics[];

  @Authorized()
  @Field(() => [StatisticsSale], { nullable: true })
  statisticsSales?: StatisticsSale[];
}
