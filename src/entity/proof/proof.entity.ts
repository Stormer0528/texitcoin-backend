import { ObjectType, Field, ID, Int } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { ProofType } from '@/graphql/enum';
import { PFile } from '../file/file.entity';
import { PROOFTYPE } from './proof.type';
import { RefLink } from '../referenceLink/referenceLink.entity';

@ObjectType()
export class Proof extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  refId: string;

  @Field(() => ProofType)
  type: PROOFTYPE;

  @Field()
  amount: number;

  @Field()
  orderedAt: Date;

  @Field({ nullable: true })
  note?: string;

  @Field(() => [PFile], { nullable: 'itemsAndList' })
  files?: PFile[];

  @Field(() => [RefLink], { nullable: 'itemsAndList' })
  reflinks?: RefLink[];
}
