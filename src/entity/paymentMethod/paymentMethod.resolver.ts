import { Service } from 'typedi';
import {
  Arg,
  Args,
  Resolver,
  Query,
  Mutation,
  Info,
  Authorized,
  FieldResolver,
  Ctx,
  Root,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { UserRole } from '@/type';
import { Context } from '@/context';

import { Transaction } from '@/graphql/decorator';
import { IDInput, SuccessResponse } from '@/graphql/common.type';
import { SuccessResult } from '@/graphql/enum';
import { PaymentMethod } from './paymentMethod.entity';
import {
  CreatePaymentMethodInput,
  PaymentMethodQueryArgs,
  PaymentMethodResponse,
  UpdatePaymentMethodInput,
} from './paymentMethod.type';
import { PaymentMethodService } from './paymentMethod.service';
import { PaymentMethodLinkService } from '../paymentMethodLink/paymentMethodLink.service';
import { PaymentMethodLink } from '../paymentMethodLink/paymentMethodLink.entity';

@Service()
@Resolver(() => PaymentMethod)
export class PaymentMethodResolver {
  constructor(
    private readonly service: PaymentMethodService,
    private readonly paymentLinkService: PaymentMethodLinkService
  ) {}

  @Query(() => PaymentMethodResponse)
  async paymentMethods(
    @Args() query: PaymentMethodQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<PaymentMethodResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; paymentMethods?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getPaymentMethodsCount(query);
    }

    if ('paymentMethods' in fields) {
      promises.paymentMethods = this.service.getPaymentMethods(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; paymentMethods?: PaymentMethod[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => PaymentMethod)
  async createPaymentMethod(@Arg('data') data: CreatePaymentMethodInput): Promise<PaymentMethod> {
    const { paymentMethodLinks, ...restData } = data;
    const paymentMethod = await this.service.createPaymentMethod(restData);
    if (paymentMethodLinks) {
      await this.paymentLinkService.setPaymentMethodLinksByPaymentMethodId(
        paymentMethod.id,
        paymentMethodLinks
      );
    }
    return paymentMethod;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => PaymentMethod)
  async updatePaymentMethod(@Arg('data') data: UpdatePaymentMethodInput): Promise<PaymentMethod> {
    const { paymentMethodLinks, ...restData } = data;
    if (paymentMethodLinks) {
      await this.paymentLinkService.setPaymentMethodLinksByPaymentMethodId(
        data.id,
        paymentMethodLinks
      );
    }
    return this.service.updatePaymentMethod(restData);
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async removePaymentMethod(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    await this.paymentLinkService.removePaymentMethodLinksByPaymentMethodId(data.id);
    await this.service.removePaymentMethod(data);
    return {
      result: SuccessResult.success,
    };
  }

  @FieldResolver({ nullable: true })
  async paymentMethodLinks(
    @Root() method: PaymentMethod,
    @Ctx() ctx: Context
  ): Promise<PaymentMethodLink[]> {
    return ctx.dataLoader.get('paymentMethodLinksForPaymentMethodLoader').load(method.id);
  }
}
