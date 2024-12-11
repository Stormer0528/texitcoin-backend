import type { Prisma } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';
import { IsAlphanumeric, IsEmail, IsNotEmpty, Length, ValidateIf } from 'class-validator';
import { ObjectType, InputType, Field, ArgsType, ID, Int } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';
import { EmailInput } from '@/graphql/common.type';
import { PlacementPosition, SuccessResult, TeamStrategy } from '@/graphql/enum';

import { Member } from '@/entity/member/member.entity';
import { MemberWalletDataInput } from '../memberWallet/memberWallet.type';

// Member Query Args
@ArgsType()
export class MemberQueryArgs extends QueryArgsBase<Prisma.MemberWhereInput> {}

// Member list response with pagination ( total )
@ObjectType()
export class MembersResponse extends PaginatedResponse {
  @Field(() => [Member], { nullable: true })
  members?: Member[];
}

@ObjectType()
export class Introducer {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  fullName: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class IntroducersResponse extends PaginatedResponse {
  @Field(() => [Introducer], { nullable: true })
  introducers?: Introducer[];
}

// Create Member Input and Response
@InputType()
export class CreateMemberInput {
  @Field()
  @IsNotEmpty()
  @IsAlphanumeric()
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

  @Field({ nullable: true })
  assetId?: string;

  @Field(() => ID)
  sponsorId: string;

  @Field(() => ID, { nullable: true })
  placementParentId?: string;

  @Field(() => PlacementPosition, { nullable: true })
  placementPosition?: PlacementPosition;

  @Field({ nullable: true, defaultValue: true })
  status?: boolean;

  @Field({ nullable: true, defaultValue: true })
  syncWithSendy?: boolean;

  @Field({ nullable: true })
  preferredContact?: string;

  @Field({ nullable: true })
  preferredContactDetail?: string;

  @Field(() => TeamStrategy, { nullable: true })
  teamStrategy?: TEAM_STRATEGY;

  @Field(() => [MemberWalletDataInput])
  wallets: MemberWalletDataInput[];
}

@InputType()
export class SignupFormInput {
  @Field()
  @IsNotEmpty()
  @IsAlphanumeric()
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

  @Field({ nullable: true })
  assetId?: string;

  @Field(() => ID, { nullable: true })
  sponsorUserId?: string;

  @Field()
  @Length(6)
  password: string;

  @Field(() => ID, { nullable: true })
  packageId?: string;

  @Field({ nullable: true })
  paymentMethod?: string;

  @Field({ nullable: true })
  preferredContact?: string;

  @Field({ nullable: true })
  preferredContactDetail?: string;
}

@InputType()
export class UpdateMemberInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  @IsAlphanumeric()
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

  @Field(() => PlacementPosition, { nullable: true })
  placementPosition?: PlacementPosition;

  @Field({ nullable: true })
  status?: boolean;

  @Field({ nullable: true, defaultValue: true })
  syncWithSendy?: boolean;

  @Field({ nullable: true })
  preferredContact?: string;

  @Field({ nullable: true })
  preferredContactDetail?: string;

  @Field(() => TeamStrategy, { nullable: true })
  teamStrategy?: TEAM_STRATEGY;

  @Field(() => [MemberWalletDataInput], { nullable: true })
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

export type PLACEMENT_POSITION = 'LEFT' | 'RIGHT' | 'NONE';

export type TEAM_STRATEGY = 'LEFT' | 'RIGHT' | 'BALANCE' | 'MANUAL';

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

@ObjectType()
export class EmailVerificationResponse {
  @Field()
  token: string;
}

@InputType()
export class EmailVerificationInput extends EmailInput {
  @Field()
  token: string;

  @Field()
  digit: string;
}

@ObjectType()
export class EmailVerifyResult {
  @Field(() => SuccessResult)
  result: SuccessResult;

  @Field(() => ID, { nullable: true })
  packageId?: string;

  @Field({ nullable: true })
  paymentMethod?: string;

  @Field({ nullable: true })
  message?: string;
}
