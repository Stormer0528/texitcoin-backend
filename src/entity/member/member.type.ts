import type { Prisma } from '@prisma/client';
import { IsEmail } from 'class-validator';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { Member } from '@/entity/member/member.entity';
import { MemberWalletDataInput } from '../memberWallet/memberWallet.type';

// Member Query Args
@ArgsType()
export class MemberQueryArgs extends QueryArgsBase<Prisma.MemberWhereInput> {}

// Member list response with pagination ( total )
@ObjectType()
export class MembersResponse extends PaginatedResponse {
  @Field(() => [Member], { nullable: 'itemsAndList' })
  members?: Member[];
}

// Create Member Input and Response
@InputType()
export class CreateMemberInput {
  @Field()
  username: string;

  @Field()
  fullName: string;

  @Field()
  primaryAddress: string;

  @Field({ nullable: true })
  secondaryAddress?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  zipCode?: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  mobile: string;

  @Field()
  assetId: string;

  @Field(() => ID, { nullable: true })
  sponsorId?: string;

  @Field(() => ID, { nullable: true })
  placementParentId?: string;

  @Field({ nullable: true })
  placementPosition?: PLACEMENT_POSITION;

  @Field({ nullable: true })
  point?: number;

  @Field(() => [MemberWalletDataInput])
  wallets: MemberWalletDataInput[];
}

@InputType()
export class UpdateMemberInput {
  @Field(() => ID, { nullable: true })
  id?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  fullName?: string;

  @Field({ nullable: true })
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  mobile?: string;

  @Field({ nullable: true })
  assetId?: string;

  @Field(() => ID, { nullable: true })
  sponsorId?: string;

  @Field({ nullable: true })
  primaryAddress?: string;

  @Field({ nullable: true })
  secondaryAddress?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  zipCode?: string;

  @Field(() => ID, { nullable: true })
  placementParentId?: string;

  @Field({ nullable: true })
  placementPosition?: PLACEMENT_POSITION;

  @Field({ nullable: true })
  point?: number;

  @Field(() => [MemberWalletDataInput], { nullable: 'itemsAndList' })
  wallets?: MemberWalletDataInput[];
}

@InputType()
export class UpdateMemberPasswordInputById {
  @Field(() => ID)
  id: string;

  @Field()
  newPassword: string;
}

@InputType()
export class UpdateMemberPasswordInput {
  @Field()
  oldPassword?: string;

  @Field()
  newPassword: string;
}

// Login Input and Response

@InputType()
export class MemberLoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class MemberLoginResponse {
  @Field()
  accessToken: string;
}

@InputType()
export class ResetPasswordTokenInput {
  @Field()
  token: string;

  @Field()
  password: string;
}

@ObjectType()
export class VerifyTokenResponse {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  token: string;
}

@InputType()
export class MemberOverviewInput {
  @Field(() => ID)
  id: string;
}

@ObjectType()
export class MemberOverview {
  @Field()
  currentHashPower: number;

  @Field()
  totalTXCShared: bigint;

  @Field()
  joinDate: Date;
}

export type PLACEMENT_POSITION = 'LEFT' | 'RIGHT';

@ObjectType()
export class PlacementPositionCountResponse {
  @Field()
  leftCount: number;

  @Field()
  rightCount: number;
}
