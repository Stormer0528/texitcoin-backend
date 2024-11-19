import { ObjectType, Field, ID, Int } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { ProofType } from '@/graphql/enum';
import { PFile } from '../file/file.entity';
import { PROOFTYPE } from './proof.type';

@ObjectType()
export class Proof extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  orderedAt: Date;

  @Field(() => ProofType)
  type: PROOFTYPE;

  @Field()
  amount: number;

  @Field(() => [PFile], { nullable: 'itemsAndList' })
  paymentConfirm?: PFile[];

  @Field({ nullable: true })
  note?: string;
}
