import { Service } from 'typedi';
import {
  Arg,
  Args,
  Resolver,
  Query,
  Mutation,
  Info,
  Authorized,
  Root,
  Ctx,
  FieldResolver,
} from 'type-graphql';
import graphqlFields from 'graphql-fields';
import { GraphQLResolveInfo } from 'graphql';

import { UserRole } from '@/type';
import { Context } from '@/context';

import { SuccessResponse } from '@/graphql/common.type';
import {
  MemberWalletQueryArgs,
  MemberWalletResponse,
  UpdateMemberWalletInput,
} from './memberWallet.type';
import { MemberWallet } from './memberWallet.entity';
import { Member } from '../member/member.entity';
import { Payout } from '../payout/payout.entity';
import { MemberStatisticsWallet } from '../memberStatisticsWallet/memberStatisticsWallet.entity';
import { MemberWalletService } from './memberWallet.service';
import { Transaction } from '@/graphql/decorator';
import { SuccessResult } from '@/graphql/enum';

@Service()
@Resolver(() => MemberWallet)
export class MemberWalletResolver {
  constructor(private readonly service: MemberWalletService) {}

  @Query(() => MemberWalletResponse)
  async memberWallets(
    @Args() query: MemberWalletQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<MemberWalletResponse> {
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; memberWallets?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getMemberWalletsCount(query);
    }

    if ('memberWallets' in fields) {
      promises.memberWallets = this.service.getMemberWallets(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; memberWallets?: MemberWallet[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async updateMemberWallet(@Arg('data') data: UpdateMemberWalletInput): Promise<SuccessResponse> {
    await this.service.updateManyMemberWallet(data);
    return {
      result: SuccessResult.success,
    };
  }

  @FieldResolver({ nullable: true })
  async member(@Root() memberWallet: MemberWallet, @Ctx() ctx: Context): Promise<Member> {
    return ctx.dataLoader.get('memberForMemberWalletLoader').load(memberWallet.memberId);
  }

  @FieldResolver({ nullable: true })
  async payout(@Root() memberWallet: MemberWallet, @Ctx() ctx: Context): Promise<Payout> {
    return ctx.dataLoader.get('payoutForMemberWalletLoader').load(memberWallet.payoutId);
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async memberStatisticsWallets(
    @Root() member: MemberWallet,
    @Ctx() ctx: Context
  ): Promise<MemberStatisticsWallet[]> {
    return ctx.dataLoader.get('memberStatisticsWalletsForMemberWalletLoader').load(member.id);
  }
}
