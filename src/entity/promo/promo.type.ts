import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';
import { Promo } from './promo.entity';

// Promo Query Args
@ArgsType()
export class PromoQueryArgs extends QueryArgsBase<Prisma.PromoWhereInput> {}

// Promo list response with pagination ( total )
@ObjectType()
export class PromoResponse extends PaginatedResponse {
  @Field(() => [Promo], { nullable: true })
  promos?: Promo[];
}

// Create Promo Input and Response
@InputType()
export class CreatePromoInput {
  @Field()
  code: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  status: boolean;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;
}

@InputType()
export class UpdatePromoInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  code: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  status: boolean;

  @Field({ nullable: true })
  startDate: Date;

  @Field({ nullable: true })
  endDate: Date;
}
