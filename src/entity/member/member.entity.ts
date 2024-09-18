import { ObjectType, Field, ID, Args, Authorized } from 'type-graphql';
import { IsEmail } from 'class-validator';

import { BaseEntity } from '@/graphql/baseEntity';

import { Sale } from '@/entity/sale/sale.entity';
import { MemberStatistics } from '../memberStatistics/memberStatistics.entity';
import { MemberWallet } from '../memberWallet/memberWallet.entity';
import { MemberLog, PLACEMENT_POSITION } from './member.type';
import { UserRole } from '@/type';

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

  userId: number;

  @Field()
  mobile: string;

  @Field()
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

  @Field({ nullable: true })
  placementPosition?: string;

  @Field()
  point: number;

  @Field(() => [Sale], { nullable: 'itemsAndList' })
  sales?: Sale[];

  @Field(() => [MemberStatistics], { nullable: 'itemsAndList' })
  statistics?: MemberStatistics[];

  @Field(() => Member, { nullable: true })
  sponsor?: Member;

  @Field(() => [Member], { nullable: 'itemsAndList' })
  introduceMembers?: Member[];

  @Field(() => [MemberWallet], { nullable: 'itemsAndList' })
  memberWallets?: MemberWallet[];

  @Field(() => Member, { nullable: true })
  placementParent?: Member;

  @Field(() => [Member], { nullable: 'itemsAndList' })
  placementChildren?: Member[];

  @Authorized([UserRole.Admin])
  @Field(() => [MemberLog], { nullable: 'itemsAndList' })
  logs?: MemberLog[];
}
