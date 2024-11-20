import { ObjectType, Field, ID, Int } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { Proof } from '../proof/proof.entity';

@ObjectType()
export class PrepaidCommission extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  ID: number;

  @Field(() => ID)
  memberId: string;

  @Field({ nullable: true })
  txType?: string;

  @Field(() => ID, { nullable: true })
  txId?: string;

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

  @Field(() => Member, { nullable: true })
  member?: Member;

  @Field(() => Proof, { nullable: true })
  proof?: Proof;
}
