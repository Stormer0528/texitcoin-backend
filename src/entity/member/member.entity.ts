import { ObjectType, Field, ID, Args, Authorized, Int, UseMiddleware } from 'type-graphql';
import { IsAlphanumeric, IsEmail } from 'class-validator';

import { BaseEntity } from '@/graphql/baseEntity';

import { Sale } from '@/entity/sale/sale.entity';
import { MemberStatistics } from '../memberStatistics/memberStatistics.entity';
import { MemberWallet } from '../memberWallet/memberWallet.entity';
import {
  MEMBER_STATE,
  MemberLog,
  PLACEMENT_POSITION,
  TEAM_REPORT,
  TEAM_STRATEGY,
} from './member.type';
import { UserRole } from '@/type';
import { MemberState, PlacementPosition, TeamReport, TeamStrategy } from '@/graphql/enum';
import { WeeklyCommission } from '../weeklycommission/weeklycommission.entity';
import { AdminNotes } from '../adminNotes/adminNotes.entity';
import { CommissionStatus } from '../weeklycommission/weeklycommission.type';
import { Balance } from '../balance/balance.entity';
import { canAccess } from '@/graphql/middlewares';
import GraphQLJSON, { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class Member extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  @IsAlphanumeric()
  username: string;

  @Field()
  fullName: string;

  @Field(() => ID, { nullable: true })
  sponsorId: string;

  @Field()
  // @UseMiddleware(canAccess())
  @IsEmail()
  email: string;

  @Field(() => Int, { nullable: true })
  ID: number;

  @Field()
  mobile: string;

  @Field({ nullable: true })
  assetId: string;

  @Field({ nullable: true })
  country?: string;

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

  @Field(() => ID, { nullable: true })
  placementParentId?: string;

  @Field(() => PlacementPosition)
  placementPosition: PLACEMENT_POSITION;

  placementPath?: string;

  @Field()
  point: number;

  @Field()
  emailVerified: boolean;

  @Field()
  status: boolean;

  @Field()
  totalIntroducers: number;

  @Field()
  syncWithSendy: boolean;

  @Field({ nullable: true })
  preferredContact?: string;

  @Field({ nullable: true })
  preferredContactDetail?: string;

  @Field({ nullable: true })
  promoCode?: string;

  @Field(() => TeamStrategy)
  teamStrategy: TEAM_STRATEGY;

  @Field(() => MemberState)
  allowState: MEMBER_STATE;

  @Field(() => TeamReport)
  teamReport: TEAM_REPORT;

  lastRolledSponsor: Date;

  @Field(() => CommissionStatus, { nullable: true })
  commission?: CommissionStatus;

  @Field(() => [Sale], { nullable: true })
  sales?: Sale[];

  @Field(() => [MemberStatistics], { nullable: true })
  statistics?: MemberStatistics[];

  @Field(() => Member, { nullable: true })
  sponsor?: Member;

  @Field(() => [Member], { nullable: true })
  introduceMembers?: Member[];

  @Field(() => [MemberWallet], { nullable: true })
  memberWallets?: MemberWallet[];

  @Field(() => Member, { nullable: true })
  placementParent?: Member;

  @Field(() => [Member], { nullable: true })
  placementChildren?: Member[];

  @Field(() => [WeeklyCommission], { nullable: true })
  weeklyCommissions?: WeeklyCommission[];

  @Authorized([UserRole.ADMIN])
  @Field(() => [MemberLog], { nullable: true })
  logs?: MemberLog[];

  @Authorized([UserRole.ADMIN])
  @Field(() => [AdminNotes], { nullable: true })
  adminNotes?: AdminNotes[];

  @Field(() => Int)
  cmnCalculatedWeeks?: number;

  @Field()
  groupName?: string;

  @Field()
  balance?: number;

  @Field(() => [Balance], { nullable: true })
  balances?: Balance[];

  @Field(() => GraphQLJSONObject, { nullable: true })
  signupFormRequest?: any;
}
