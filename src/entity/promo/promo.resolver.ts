import { Service } from 'typedi';
import { Arg, Args, Resolver, Query, Mutation, Info, Authorized } from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { UserRole } from '@/type';

import { Transaction } from '@/graphql/decorator';
import { IDInput, SuccessResponse } from '@/graphql/common.type';
import { PromoQueryArgs, PromoResponse, CreatePromoInput, UpdatePromoInput } from './promo.type';
import { Promo } from './promo.entity';
import { PromoService } from './promo.service';
import { SuccessResult } from '@/graphql/enum';

@Service()
@Resolver(() => Promo)
export class PromoResolver {
  constructor(private readonly service: PromoService) {}

  @Authorized()
  @Query(() => PromoResponse)
  async balances(
    @Args() query: PromoQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<PromoResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; promos?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getPromosCount(query);
    }

    if ('promos' in fields) {
      promises.promos = this.service.getPromos(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; promos?: Promo[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => Promo)
  async createPromo(@Arg('data') data: CreatePromoInput): Promise<Promo> {
    return this.service.createPromo(data);
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => Promo)
  async updatePromo(@Arg('data') data: UpdatePromoInput): Promise<Promo> {
    return this.service.updatePromo(data);
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async removePromo(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    await this.service.removePromo(data);
    return {
      result: SuccessResult.success,
    };
  }
}
