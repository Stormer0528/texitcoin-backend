import type { Prisma } from '@prisma/client';
import { IsEmail, IsUrl } from 'class-validator';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { FileSale } from './fileSale.entity';

// FileSale Query Args
@ArgsType()
export class FileSaleQueryArgs extends QueryArgsBase<Prisma.FileSaleWhereInput> {}

// FileSale list response with pagination ( total )
@ObjectType()
export class FileSaleResponse extends PaginatedResponse {
  @Field(() => [FileSale], { nullable: 'itemsAndList' })
  fileSales?: FileSale[];
}

// Create FileSale Input and Response
@InputType()
export class CreateFileSaleInput {
  @Field(() => ID)
  saleId: string;

  @Field(() => ID)
  fileId: string;
}

@InputType()
export class UpdateFileSaleInput {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  saleId?: string;

  @Field(() => ID)
  fileId?: string;
}
