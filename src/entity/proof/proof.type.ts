import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID, Int } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { Proof } from './proof.entity';
import { ProofType } from '@/graphql/enum';
import { LinkInput } from '../referenceLink/referenceLink.type';
import { IsNotIn } from 'class-validator';

// Proof Query Args
@ArgsType()
export class ProofQueryArgs extends QueryArgsBase<Prisma.ProofWhereInput> {}

// Proof list response with pagination ( total )
@ObjectType()
export class ProofResponse extends PaginatedResponse {
  @Field(() => [Proof], { nullable: true })
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
  orderedAt?: Date;

  @Field({ nullable: true })
  mineLocation?: string;

  @Field({ nullable: true })
  note?: string;

  @Field(() => [ID], { nullable: true })
  fileIds?: string[];

  @Field(() => [LinkInput], { nullable: true })
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
  orderedAt?: Date;

  @Field({ nullable: true })
  mineLocation?: string;

  @Field({ nullable: true })
  note?: string;

  @Field(() => [ID], { nullable: true })
  fileIds?: string[];

  @Field(() => [LinkInput], { nullable: true })
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
  mineLocation?: string;

  @Field({ nullable: true })
  orderedAt?: Date;

  @Field({ nullable: true })
  note?: string;

  @Field(() => [ID], { nullable: true })
  fileIds?: string[];

  @Field(() => [LinkInput], { nullable: true })
  reflinks?: LinkInput[];
}

export type PROOFTYPE =
  | 'COMMISSION'
  | 'MINENEWEQUIPMENT'
  | 'MINEELECTRICITY'
  | 'MINEMAINTAINANCE'
  | 'MINEFACILITYRENTMORTAGE'
  | 'MARKETINGTXCPROMOTION'
  | 'MARKETINGMINETXCPROMOTION'
  | 'INFRASTRUCTURE'
  | 'OVERHEAD'
  | 'ADMINISTRATIONSALARY'
  | 'PROMOTION'
  | 'PROFIT'
  | 'SALE'
  | 'DEVELOPERSPROTOCOL'
  | 'DEVELOPERSWEB'
  | 'DEVELOPERSAPPS'
  | 'DEVELOPERSINTEGRATIONS'
  | 'EXCHANGEFEE'
  | 'TRANSACTIONPROCESSING';

@InputType()
export class ReferenceInput {
  @Field(() => ID)
  refId: string;

  @Field(() => ProofType)
  type: PROOFTYPE;
}
