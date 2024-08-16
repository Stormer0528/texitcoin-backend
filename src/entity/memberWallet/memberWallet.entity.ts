import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { Payout } from '../payout/payout.entity';
import { MemberStatisticsWallet } from '../memberStatisticsWallet/memberStatisticsWallet.entity';

@ObjectType()
export class MemberWallet extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  memberId: string;

  @Field(() => ID)
  payoutId: string;

  @Field()
  address: string;

  @Field()
  percent: number;

  @Field(() => Member, { nullable: true })
  member?: Member;

  @Field(() => Payout, { nullable: true })
  payout?: Payout;

  @Field(() => [MemberStatisticsWallet], { nullable: 'itemsAndList' })
  memberStatisticsWallets?: MemberStatisticsWallet[];
}
