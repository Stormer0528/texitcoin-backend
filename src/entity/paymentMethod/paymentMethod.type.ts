import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';
import { PaymentMethod } from './paymentMethod.entity';
import { PaymentMethodLinkInput } from '../paymentMethodLink/paymentMethodLink.type';

// PaymentMethod Query Args
@ArgsType()
export class PaymentMethodQueryArgs extends QueryArgsBase<Prisma.PaymentMethodWhereInput> {}

// PaymentMethod list response with pagination ( total )
@ObjectType()
export class PaymentMethodResponse extends PaginatedResponse {
  @Field(() => [PaymentMethod], { nullable: 'itemsAndList' })
  paymentMethods?: PaymentMethod[];
}

// Create Payment Method Input and Response
@InputType()
export class CreatePaymentMethodInput {
  @Field()
  name: string;

  @Field({ nullable: true, defaultValue: true })
  visible?: boolean;

  @Field({ nullable: true })
  defaultLink?: string;

  @Field(() => [PaymentMethodLinkInput], { nullable: 'itemsAndList' })
  paymentMethodLinks?: PaymentMethodLinkInput[];
}

@InputType()
export class UpdatePaymentMethodInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  visible?: boolean;

  @Field({ nullable: true })
  defaultLink?: string;

  @Field(() => [PaymentMethodLinkInput], { nullable: 'itemsAndList' })
  paymentMethodLinks?: PaymentMethodLinkInput[];
}
