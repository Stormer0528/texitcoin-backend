import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID, Int } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { Proof } from './proof.entity';
import { ProofType } from '@/graphql/enum';
import { LinkInput } from '../referenceLink/referenceLink.type';

// Proof Query Args
@ArgsType()
export class ProofQueryArgs extends QueryArgsBase<Prisma.ProofWhereInput> {}

// Proof list response with pagination ( total )
@ObjectType()
export class ProofResponse extends PaginatedResponse {
  @Field(() => [Proof], { nullable: 'itemsAndList' })
  proofs?: Proof[];
}

// Create Proof Input and Response
@InputType()
export class CreateProofInput {
  @Field(() => ID)
  refId: string;

  @Field(() => ProofType)
  type: PROOFTYPE;

  @Field()
  amount: number;

  @Field({ nullable: true })
  note?: string;

  @Field(() => [ID], { nullable: 'itemsAndList' })
  fileIds?: string[];

  @Field(() => [LinkInput], { nullable: 'itemsAndList' })
  reflinks?: LinkInput[];
}

@InputType()
export class UpdateProofByIDInput {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  refId?: string;

  @Field(() => ProofType, { nullable: true })
  type?: PROOFTYPE;

  @Field({ nullable: true })
  amount?: number;

  @Field({ nullable: true })
  note?: string;

  @Field(() => [ID], { nullable: 'itemsAndList' })
  fileIds?: string[];

  @Field(() => [LinkInput], { nullable: 'itemsAndList' })
  reflinks?: LinkInput[];
}

@InputType()
export class UpdateProofByReferenceInput {
  @Field(() => ID)
  refId: string;

  @Field(() => ProofType)
  type: PROOFTYPE;

  @Field({ nullable: true })
  amount?: number;

  @Field({ nullable: true })
  note?: string;

  @Field(() => [ID], { nullable: 'itemsAndList' })
  fileIds?: string[];

  @Field(() => [LinkInput], { nullable: 'itemsAndList' })
  reflinks?: LinkInput[];
}

export type PROOFTYPE =
  | 'COMMISSION'
  | 'MINE'
  | 'INFRASTRUCTURE'
  | 'OVERHEAD'
  | 'SALARY'
  | 'PROMOTION'
  | 'PROFIT'
  | 'SALE'
  | 'PREPAY';

@InputType()
export class ReferenceInput {
  @Field(() => ID)
  refId: string;

  @Field(() => ProofType)
  type: PROOFTYPE;
}
