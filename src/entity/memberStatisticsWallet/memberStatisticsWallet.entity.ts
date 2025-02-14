import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { MemberStatistics } from '../memberStatistics/memberStatistics.entity';
import { MemberWallet } from '../memberWallet/memberWallet.entity';

@ObjectType()
export class MemberStatisticsWallet extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  memberStatisticId: string;

  @Field()
  memberWalletId: string;

  @Field()
  txc: bigint;

  @Field()
  issuedAt: Date;

  @Field(() => MemberStatistics, { nullable: true })
  memberStatistic?: MemberStatistics;

  @Field(() => MemberWallet, { nullable: true })
  memberWallet?: MemberWallet;
}
