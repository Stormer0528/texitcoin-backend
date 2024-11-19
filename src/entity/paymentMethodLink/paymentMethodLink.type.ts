import type { Prisma } from '@prisma/client';
import { ObjectType, InputType, Field, ArgsType, ID } from 'type-graphql';

import { QueryArgsBase } from '@/graphql/queryArgs';
import { PaginatedResponse } from '@/graphql/paginatedResponse';
import { PaymentMethodLink } from './paymentMethodLink.entity';

// PaymentMethodLink Query Args
@ArgsType()
export class PaymentMethodLinksQueryArgs extends QueryArgsBase<Prisma.PaymentMethodLinkWhereInput> {}

// PaymentMethodLink list response with pagination ( total )
@ObjectType()
export class PaymentMethodLinkResponse extends PaginatedResponse {
  @Field(() => [PaymentMethodLink], { nullable: 'itemsAndList' })
  paymentMethodLinks?: PaymentMethodLink[];
}

// Create PaymentMethodLink Input and Response
@InputType()
export class CreatePaymentMethodLinkInput {
  @Field(() => ID)
  paymentMethodId: string;

  @Field(() => ID)
  packageId: string;

  @Field()
  link: string;
}

@InputType()
export class UpdatePaymentMethodLinkInput {
  @Field(() => ID)
  paymentMethodId: string;

  @Field(() => ID, { nullable: true })
  packageId?: string;

  @Field({ nullable: true })
  link?: string;
}

@InputType()
export class PaymentMethodLinkInput {
  @Field(() => ID)
  packageId: string;

  @Field()
  link: string;
}
