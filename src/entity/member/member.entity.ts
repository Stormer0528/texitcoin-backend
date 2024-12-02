import { ObjectType, Field, ID, Args, Authorized, Int } from 'type-graphql';
import { IsEmail } from 'class-validator';

import { BaseEntity } from '@/graphql/baseEntity';

import { Sale } from '@/entity/sale/sale.entity';
import { MemberStatistics } from '../memberStatistics/memberStatistics.entity';
import { MemberWallet } from '../memberWallet/memberWallet.entity';
import { MemberLog, PLACEMENT_POSITION } from './member.type';
import { UserRole } from '@/type';
import { PlacementPosition } from '@/graphql/enum';
import { WeeklyCommission } from '../weeklycommission/weeklycommission.entity';
import { AdminNotes } from '../adminNotes/adminNotes.entity';
import { CommissionStatus } from '../weeklycommission/weeklycommission.type';

@ObjectType()
export class Member extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  username: string;

  @Field()
  fullName: string;

  @Field(() => ID, { nullable: true })
  sponsorId: string;

  @Field()
  @IsEmail()
  email: string;

  @Field(() => Int)
  ID: number;

  @Field()
  mobile: string;

  @Field({ nullable: true })
  assetId: string;

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

  @Field(() => PlacementPosition, { nullable: true })
  placementPosition?: PLACEMENT_POSITION;

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

  @Authorized([UserRole.Admin])
  @Field(() => [MemberLog], { nullable: true })
  logs?: MemberLog[];

  @Authorized([UserRole.Admin])
  @Field(() => [AdminNotes], { nullable: true })
  adminNotes?: AdminNotes[];

  @Field(() => Int)
  cmnCalculatedWeeks?: number;
}
