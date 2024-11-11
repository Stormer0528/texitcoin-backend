import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { FileCommission } from './fileCommission.entity';

// FileCommission Query Args
@ArgsType()
export class FileCommissionQueryArgs extends QueryArgsBase<Prisma.FileCommissionWhereInput> {}

// FileCommission list response with pagination ( total )
@ObjectType()
export class FileCommissionResponse extends PaginatedResponse {
  @Field(() => [FileCommission], { nullable: 'itemsAndList' })
  fileCommissions?: FileCommission[];
}

// Create FileCommission Input and Response
@InputType()
export class CreateFileCommissionInput {
  @Field(() => ID)
  commissionId: string;

  @Field(() => ID)
  fileId: string;
}

@InputType()
export class UpdateFileCommissionInput {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  commissionId?: string;

  @Field(() => ID)
  fileId?: string;
}
