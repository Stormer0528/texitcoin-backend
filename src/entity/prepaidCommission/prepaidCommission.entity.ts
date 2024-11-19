import { ObjectType, Field, ID, Int } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { PFile } from '../file/file.entity';
import { Member } from '../member/member.entity';

@ObjectType()
export class PrepaidCommission extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  memberId: string;

  @Field({ nullable: true })
  txType?: string;

  @Field(() => ID, { nullable: true })
  txId?: string;

  @Field({ nullable: true })
  note?: string;

  @Field(() => Int)
  pkgL: number;

  @Field(() => Int)
  pkgR: number;

  @Field(() => Int)
  commission: number;

  @Field()
  orderedAt: Date;

  @Field()
  weekStartDate: Date;

  @Field(() => [PFile], { nullable: 'itemsAndList' })
  paymentConfirm?: PFile[];

  @Field(() => Member, { nullable: true })
  member?: Member;
}
