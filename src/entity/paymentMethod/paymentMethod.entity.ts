import { ObjectType, Field, ID } from 'type-graphql';

import { BaseEntity } from '@/graphql/baseEntity';
import { PaymentMethodLink } from '../paymentMethodLink/paymentMethodLink.entity';

@ObjectType()
export class PaymentMethod extends BaseEntity {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  visible: boolean;

  @Field({ nullable: true })
  defaultLink?: string;

  @Field(() => [PaymentMethodLink], { nullable: true })
  paymentMethodLinks?: PaymentMethodLink[];
}
