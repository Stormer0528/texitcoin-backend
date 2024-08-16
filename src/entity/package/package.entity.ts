import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Sale } from '../sale/sale.entity';

@ObjectType()
export class Package extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  productName: string;

  @Field()
  amount: number;

  @Field()
  status: boolean;

  @Field()
  date: Date;

  @Field()
  token: number;

  @Field(() => [Sale], { nullable: 'itemsAndList' })
  sales?: Sale[];
}
