import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Statistics } from '../statistics/statistics.entity';
import { Sale } from '../sale/sale.entity';

@ObjectType()
export class StatisticsSale extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  statisticsId: string;

  @Field(() => ID)
  saleId: string;

  @Field()
  issuedAt: Date;

  @Field(() => Statistics, { nullable: true })
  statistics?: Statistics;

  @Field(() => Sale, { nullable: true })
  sale?: Sale;
}
