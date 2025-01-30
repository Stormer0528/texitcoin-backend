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

import { Transaction } from '@/graphql/decorator';
import { IDInput, SuccessResponse } from '@/graphql/common.type';
import {
  BalanceQueryArgs,
  BalanceResponse,
  AddBalanceInput,
  UpdateBalanceInput,
} from './balance.type';
import { Balance } from './balance.entity';
import { BalanceService } from './balance.service';
import { SuccessResult } from '@/graphql/enum';
import { Member } from '../member/member.entity';
import { Context } from '@/context';

@Service()
@Resolver(() => Balance)
export class BalanceResolver {
  constructor(private readonly service: BalanceService) {}

  // @Authorized()
  @Query(() => BalanceResponse)
  async balances(
    @Args() query: BalanceQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<BalanceResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; balances?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getBalancesCount(query);
    }

    if ('balances' in fields) {
      promises.balances = this.service.getBalances(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; balances?: Balance[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => Balance)
  async addBalance(@Arg('data') data: AddBalanceInput): Promise<Balance> {
    return this.service.addBalance(data);
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => Balance)
  async updateBalance(@Arg('data') data: UpdateBalanceInput): Promise<Balance> {
    return this.service.updateBalance(data);
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async removeBalance(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    await this.service.removeBalance(data);
    return {
      result: SuccessResult.success,
    };
  }

  @FieldResolver(() => Member, { nullable: true })
  async member(@Root() balance: Balance, @Ctx() ctx: Context): Promise<Member> {
    return ctx.dataLoader.get('memberForBalanceLoader').load(balance.memberId);
  }
}
