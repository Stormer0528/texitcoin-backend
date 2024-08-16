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
  Root,
  Ctx,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { UserRole } from '@/type';
import { Context } from '@/context';

import { CreatePayoutInput, PayoutQueryArgs, PayoutResponse } from './payout.type';
import { Payout } from './payout.entity';
import { MemberWallet } from '../memberWallet/memberWallet.entity';
import { PayoutService } from './payout.service';

@Service()
@Resolver(() => Payout)
export class PayoutResolver {
  constructor(private readonly service: PayoutService) {}

  @Query(() => PayoutResponse)
  async payouts(
    @Args() query: PayoutQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<PayoutResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; payouts?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getPayoutsCount(query);
    }

    if ('payouts' in fields) {
      promises.payouts = this.service.getPayouts(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; payouts?: Payout[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => Payout)
  async createPayout(@Arg('data') data: CreatePayoutInput): Promise<Payout> {
    return this.service.createPayout(data);
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async memberWallets(@Root() payout: Payout, @Ctx() ctx: Context): Promise<MemberWallet[]> {
    return ctx.dataLoader.get('memberWalletsForPayoutLoader').load(payout.id);
  }
}
