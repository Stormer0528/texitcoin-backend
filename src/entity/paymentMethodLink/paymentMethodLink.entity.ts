import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';
import { PaymentMethod } from '../paymentMethod/paymentMethod.entity';
import { Package } from '../package/package.entity';

@ObjectType()
export class PaymentMethodLink extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  paymentMethodId: string;

  @Field(() => ID)
  packageId: string;

  @Field()
  link: string;

  @Field(() => PaymentMethod, { nullable: true })
  paymentMethod?: PaymentMethod;

  @Field(() => Package, { nullable: true })
  package?: Package;
}
