import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { FileRelation } from './fileRelation.entity';

// FileRelation Query Args
@ArgsType()
export class FileRelationQueryArgs extends QueryArgsBase<Prisma.FileRelationWhereInput> {}

// FileRelation list response with pagination ( total )
@ObjectType()
export class FileRelationResponse extends PaginatedResponse {
  @Field(() => [FileRelation], { nullable: 'itemsAndList' })
  fileRelations?: FileRelation[];
}

// Create FileRelation Input and Response
@InputType()
export class CreateFileRelationInput {
  @Field(() => ID, { nullable: true })
  saleId?: string;

  @Field(() => ID, { nullable: true })
  commissionId?: string;

  @Field(() => ID, { nullable: true })
  prepaidCommissionId?: string;

  @Field(() => ID, { nullable: true })
  proofId?: string;

  @Field(() => ID)
  fileId: string;
}

@InputType()
export class UpdateFileRelationInput {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  saleId?: string;

  @Field(() => ID, { nullable: true })
  commissionId?: string;

  @Field(() => ID, { nullable: true })
  prepaidCommissionId?: string;

  @Field(() => ID, { nullable: true })
  proofId?: string;

  @Field(() => ID)
  fileId?: string;
}
