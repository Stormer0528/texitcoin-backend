import { Service } from 'typedi';
import { Args, Resolver, Query, Info, FieldResolver, Ctx, Root } from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { PaymentMethodLink } from './paymentMethodLink.entity';
import { PaymentMethodLinkService } from './paymentMethodLink.service';
import { PaymentMethodLinkResponse, PaymentMethodLinksQueryArgs } from './paymentMethodLink.type';
import { Context } from '@/context';
import { PaymentMethod } from '../paymentMethod/paymentMethod.entity';
import { Package } from '../package/package.entity';

@Service()
@Resolver(() => PaymentMethodLink)
export class PaymentMethodLinkResolver {
  constructor(private readonly service: PaymentMethodLinkService) {}

  @Query(() => PaymentMethodLinkResponse)
  async paymentMethodLinks(
    @Args() query: PaymentMethodLinksQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<PaymentMethodLinkResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; paymentMethodLinks?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getPaymentMethodLinksCount(query);
    }

    if ('paymentMethodLinks' in fields) {
      promises.paymentMethodLinks = this.service.getPaymentMethodLinks(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; paymentMethodLinks?: PaymentMethodLink[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @FieldResolver({ nullable: true })
  async paymentMethod(
    @Root() methodlink: PaymentMethodLink,
    @Ctx() ctx: Context
  ): Promise<PaymentMethod> {
    return ctx.dataLoader
      .get('paymentMethodForPaymentMethodLinkLoader')
      .load(methodlink.paymentMethodId);
  }

  @FieldResolver({ nullable: true })
  async package(@Root() methodlink: PaymentMethodLink, @Ctx() ctx: Context): Promise<Package> {
    return ctx.dataLoader.get('packageForPaymentMethodLinkLoader').load(methodlink.packageId);
  }
}
