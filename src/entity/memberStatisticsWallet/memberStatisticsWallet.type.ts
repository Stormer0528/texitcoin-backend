import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { MemberStatisticsWallet } from './memberStatisticsWallet.entity';
import { MemberWallet } from '../memberWallet/memberWallet.entity';

// MemberStatisticsWallet Query Args
@ArgsType()
export class MemberStatisticsWalletQueryArgs extends QueryArgsBase<Prisma.MemberStatisticsWalletWhereInput> {}

// MemberStatisticsWallet list response with pagination ( total )
@ObjectType()
export class MemberStatisticsWalletResponse extends PaginatedResponse {
  @Field(() => [MemberStatisticsWallet], { nullable: 'itemsAndList' })
  memberStatisticsWallets?: MemberStatisticsWallet[];
}

// Create MemberStatisticsWallet Input and Response
@InputType()
export class CreateMemberStatisticsWalletInput {
  @Field()
  memberStatisticId: string;

  @Field()
  memberWalletId: string;

  @Field()
  txc: number;
}

@ArgsType()
export class FromToQueryArgs {
  @Field(() => ID, { nullable: true })
  memberId?: string;

  @Field()
  from: Date;

  @Field()
  to: Date;
}

@ObjectType()
export class RewardByWallet {
  @Field(() => MemberWallet)
  wallet: MemberWallet;

  @Field()
  txc: bigint;
}

@ObjectType()
export class RewardsByWallets {
  @Field(() => [RewardByWallet])
  rewards: RewardByWallet[];
}

@ObjectType()
export class DailyReward {
  @Field()
  day: Date;

  @Field()
  totalTxc: bigint;

  @Field(() => [RewardByWallet])
  rewardsByWallet: RewardByWallet[];
}

@ObjectType()
export class DailyRewards {
  @Field(() => [DailyReward])
  rewards: DailyReward[];
}
