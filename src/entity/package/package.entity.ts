import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';

import { Sale } from '../sale/sale.entity';
import { PaymentMethodLink } from '../paymentMethodLink/paymentMethodLink.entity';

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

  @Field()
  point: number;

  @Field()
  enrollVisibility: boolean;

  @Field(() => [Sale], { nullable: true })
  sales?: Sale[];

  @Field(() => [PaymentMethodLink], { nullable: 'itemsAndList' })
  paymentMethodLinks?: PaymentMethodLink[];
}
