import { ObjectType, Field, ID, Int } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Member } from '../member/member.entity';
import { Proof } from '../proof/proof.entity';
import { WeeklyCommission } from '../weeklycommission/weeklycommission.entity';

@ObjectType()
export class PrepaidCommission extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  commissionId: string;

  @Field({ nullable: true })
  txType?: string;

  @Field(() => ID, { nullable: true })
  txId?: string;

  @Field()
  orderedAt: Date;

  @Field(() => WeeklyCommission, { nullable: true })
  commission?: WeeklyCommission;

  @Field(() => Proof, { nullable: true })
  proof?: Proof;
}
