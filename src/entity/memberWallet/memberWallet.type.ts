import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { MemberWallet } from './memberWallet.entity';

// MemberWallet Query Args
@ArgsType()
export class MemberWalletQueryArgs extends QueryArgsBase<Prisma.MemberWalletWhereInput> {}

// MemberWallet list response with pagination ( total )
@ObjectType()
export class MemberWalletResponse extends PaginatedResponse {
  @Field(() => [MemberWallet], { nullable: 'itemsAndList' })
  MemberWallets?: MemberWallet[];
}

// Create MemberWallet Input and Response
@InputType()
export class CreateMemberWalletInput {
  @Field(() => ID)
  memberId: string;

  @Field(() => [MemberWalletDataInput])
  wallets: MemberWalletDataInput[];
}

@InputType()
export class MemberWalletDataInput {
  @Field()
  payoutId: string;

  @Field()
  address: string;

  @Field()
  percent: number;
}

@InputType()
export class UpdateMemberWalletInput {
  @Field(() => ID)
  memberId: string;

  @Field(() => [MemberWalletDataInput])
  wallets: MemberWalletDataInput[];
}
