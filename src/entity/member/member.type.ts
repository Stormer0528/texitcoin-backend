import type { Prisma } from '@prisma/client';
import { IsEmail } from 'class-validator';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { Member } from '@/entity/member/member.entity';
import { MemberWalletDataInput } from '../memberWallet/memberWallet.type';
import {
  ELASTIC_LOG_ACTION_STATUS,
  ELASTIC_LOG_OWNER_ROLE,
  ELASTIC_LOG_TYPE,
} from '@/service/elasticsearch';
import GraphQLJSON from 'graphql-type-json';

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

  @Field({ nullable: true, defaultValue: true })
  status?: boolean;

  @Field(() => [MemberWalletDataInput])
  wallets: MemberWalletDataInput[];
}

@InputType()
export class SignupFormInput {
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

  @Field(() => ID)
  packageId?: string;

  @Field()
  paymentMenthod?: string;
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
  status?: boolean;

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

  @Field()
  point: number;
}

export type PLACEMENT_POSITION = 'LEFT' | 'RIGHT';

@ObjectType()
export class PlacementPositionCountResponse {
  @Field()
  leftCount: number;

  @Field()
  rightCount: number;
}

@ObjectType()
export class MemberLog {
  @Field()
  id: string;

  @Field()
  who: string;

  @Field()
  role: string;

  @Field()
  when: Date;

  @Field()
  entity: string;

  @Field()
  action: string;

  @Field()
  status: string;

  @Field(() => GraphQLJSON, { nullable: true })
  before?: any;

  @Field(() => GraphQLJSON, { nullable: true })
  after?: any;
}

@ObjectType()
export class ReferenceLink {
  @Field()
  link: string;
}
