import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';

import { StatisticsSale } from './statisticsSale.entity';

// StatisticsSale Query Args
@ArgsType()
export class StatisticsSaleQueryArgs extends QueryArgsBase<Prisma.StatisticsSaleWhereInput> {}

// StatisticsSale list response with pagination ( total )
@ObjectType()
export class StatisticsSaleResponse extends PaginatedResponse {
  @Field(() => [StatisticsSale], { nullable: 'itemsAndList' })
  statisticsSales?: StatisticsSale[];
}

// Create StatisticsSale Input and Response
@InputType()
export class CreateStatisticsSaleInput {
  @Field(() => ID)
  statisticsId: string;

  @Field(() => ID)
  saleId: string;

  @Field()
  issuedAt: Date;
}

// Create Multil UserStatistics Input and Response
@InputType()
export class CreateManyStatisticsSaleInput {
  @Field(() => [CreateStatisticsSaleInput])
  statisticsSales: CreateStatisticsSaleInput[];
}
