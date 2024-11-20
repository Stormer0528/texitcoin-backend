import { ObjectType, Field, ID, Authorized, Int } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { ConfirmationStatus } from '@/graphql/enum';
import { CONFIRMATIONSTATUS } from './weeklycommission.type';
import { PFile } from '../file/file.entity';
import { UserRole } from '@/type';
import { RefLink } from '../referenceLink/referenceLink.entity';

@ObjectType()
export class WeeklyCommission extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  ID: number;

  @Field(() => ID)
  memberId: string;

  @Field()
  weekStartDate: Date;

  @Field()
  begL: number;

  @Field()
  begR: number;

  @Field()
  newL: number;

  @Field()
  newR: number;

  @Field()
  maxL: number;

  @Field()
  maxR: number;

  @Field()
  endL: number;

  @Field()
  endR: number;

  @Field()
  pkgL: number;

  @Field()
  pkgR: number;

  @Field()
  commission: number;

  @Field(() => ConfirmationStatus)
  status: CONFIRMATIONSTATUS;

  @Authorized([UserRole.Admin])
  @Field({ nullable: true })
  note?: string;

  @Authorized([UserRole.Admin])
  @Field(() => [PFile], { nullable: 'itemsAndList' })
  paymentConfirm?: PFile[];

  @Field(() => Member, { nullable: true })
  member?: Member;

  @Authorized([UserRole.Admin])
  @Field(() => [RefLink], { nullable: 'itemsAndList' })
  reflinks?: RefLink[];
}
