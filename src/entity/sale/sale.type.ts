import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { Sale } from '@/entity/sale/sale.entity';

// Sale Query Args
@ArgsType()
export class SaleQueryArgs extends QueryArgsBase<Prisma.SaleWhereInput> {}

// Sale list response with pagination ( total )
@ObjectType()
export class SalesResponse extends PaginatedResponse {
  @Field(() => [Sale], { nullable: 'itemsAndList' })
  sales?: Sale[];
}

// Create Sale Input and Response
@InputType()
export class CreateSaleInput {
  @Field(() => ID)
  memberId: string;

  @Field(() => ID)
  packageId: string;

  @Field()
  paymentMethod: string;

  @Field()
  status: boolean;

  @Field()
  orderedAt: Date;

  @Field(() => [ID], { nullable: 'itemsAndList' })
  fileIds?: string[];
}

// Update Sale Input and Response
@InputType()
export class UpdateSaleInput {
  @Field(() => ID)
  id: string;

  @Field(() => ID, { nullable: true })
  packageId?: string;

  @Field(() => ID, { nullable: true })
  memberId?: string;

  @Field({ nullable: true })
  paymentMethod?: string;

  @Field({ nullable: true })
  orderedAt?: Date;

  @Field({ nullable: true })
  status?: boolean;

  @Field(() => [ID], { nullable: 'itemsAndList' })
  fileIds?: string[];
}
