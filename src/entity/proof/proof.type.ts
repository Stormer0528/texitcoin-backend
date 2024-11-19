import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID, Int } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { Proof } from './proof.entity';
import { ProofType } from '@/graphql/enum';

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
  @Field()
  orderedAt: string;

  @Field(() => ProofType)
  type: PROOFTYPE;

  @Field()
  amount: number;

  @Field(() => [ID], { nullable: 'itemsAndList' })
  fileIds?: string[];
}

@InputType()
export class UpdateProofInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  orderedAt?: string;

  @Field(() => ProofType, { nullable: true })
  type?: PROOFTYPE;

  @Field({ nullable: true })
  amount?: number;

  @Field(() => [ID], { nullable: 'itemsAndList' })
  fileIds?: string[];
}

export type PROOFTYPE =
  | 'COMMISSION'
  | 'MINE'
  | 'INFRASTRUCTURE'
  | 'OVERHEAD'
  | 'SALARY'
  | 'PROMOTION'
  | 'PROFIT';
