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
import { GraphQLError, GraphQLResolveInfo } from 'graphql';
import _ from 'lodash';

import { UserRole } from '@/type';
import { Context } from '@/context';

import { IDInput, SuccessResponse } from '@/graphql/common.type';
import { SalesResponse, SaleQueryArgs, CreateSaleInput, UpdateSaleInput } from './sale.type';
import { Sale } from './sale.entity';
import { Member } from '../member/member.entity';
import { Package } from '../package/package.entity';
import { StatisticsSale } from '../statisticsSale/statisticsSale.entity';
import { PFile } from '../file/file.entity';
import { SaleService } from './sale.service';
import { MemberService } from '../member/member.service';
import { Transaction } from '@/graphql/decorator';
import { FileRelationService } from '../fileRelation/fileRelation.service';
import { SuccessResult } from '@/graphql/enum';
import { MemberWalletService } from '../memberWallet/memberWallet.service';
import { PAYOUTS } from '@/consts';
import dayjs from 'dayjs';
import utcPlugin from 'dayjs/plugin/utc';

dayjs.extend(utcPlugin);

@Service()
@Resolver(() => Sale)
export class SaleResolver {
  constructor(
    private readonly service: SaleService,
    private readonly memberService: MemberService,
    private readonly fileRelationService: FileRelationService,
    private readonly memberWalletService: MemberWalletService
  ) {}

  @Authorized()
  @Query(() => SalesResponse)
  async sales(
    @Ctx() ctx: Context,
    @Args() query: SaleQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<SalesResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; sales?: any } = {};

    if (!ctx.isAdmin) {
      query.filter = {
        ...query.filter,
        memberId: ctx.user.id,
      };
    }

    if ('total' in fields) {
      promises.total = this.service.getSalesCount(query);
    }

    if ('sales' in fields) {
      promises.sales = this.service.getSales(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; sales?: Sale[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => Sale)
  async createSale(@Arg('data') data: CreateSaleInput): Promise<Sale> {
    const { emailVerified } = await this.memberService.getMemberById(data.memberId);
    if (!emailVerified) {
      throw new GraphQLError('This member did not verify the email', {
        extensions: {
          path: ['memberId'],
        },
      });
    }

    const memberWallets = await this.memberWalletService.getMemberWalletsByMemberid(data.memberId);
    const txcWallets = memberWallets.filter(
      (mw) => mw.payoutId === PAYOUTS[0] || mw.payoutId === PAYOUTS[1]
    );
    if (!txcWallets.length) {
      throw new GraphQLError('This member has no TXC wallets', {
        extensions: {
          path: ['memberId'],
        },
      });
    }

    const { fileIds, ...restData } = data;
    const member = await this.memberService.getMemberById(restData.memberId);
    const memberWeek = dayjs(member.createdAt).utc().startOf('week');
    const orderWeek = dayjs(data.orderedAt).utc().startOf('week');
    if (memberWeek > orderWeek) {
      throw new GraphQLError(
        'You cannot create a sale order for a date earlier than the week the miner joined.',
        {
          extensions: {
            path: ['orderedAt'],
          },
        }
      );
    }

    const sale = await this.service.createSale(restData);
    if (fileIds) {
      await this.fileRelationService.createFileRelations(
        fileIds.map((fileId) => ({ saleId: sale.id, fileId }))
      );
    }
    await this.memberService.updateMemberPointByMemberId(sale.memberId);
    await this.memberService.approveMember(sale.memberId);
    return sale;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => Sale)
  async updateSale(@Arg('data') data: UpdateSaleInput): Promise<Sale> {
    const oldsale = await this.service.getSaleById(data.id);
    const { fileIds, ...restData } = data;
    const member = await this.memberService.getMemberById(restData.memberId);
    const memberWeek = dayjs(member.createdAt).utc().startOf('week');
    const orderWeek = dayjs(data.orderedAt).utc().startOf('week');
    if (memberWeek > orderWeek) {
      throw new GraphQLError(
        'You cannot update the order date for a sale to a date earlier than the week the miner joined.',
        {
          extensions: {
            path: ['orderedAt'],
          },
        }
      );
    }

    const newsale = await this.service.updateSale(restData);
    if (fileIds) {
      await this.fileRelationService.setFileRelationsBySaldId(newsale.id, fileIds);
    }
    await this.memberService.updateMemberPointByMemberId(oldsale.memberId);
    await this.memberService.updateMemberPointByMemberId(newsale.memberId);
    return newsale;
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async removeSale(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    const sale = await this.service.getSaleById(data.id);
    await this.fileRelationService.removeFileRelationsBySaleId(sale.id);
    await this.service.removeSale(data);
    await this.memberService.updateMemberPointByMemberId(sale.memberId);
    return {
      result: SuccessResult.success,
    };
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async member(@Root() sale: Sale, @Ctx() ctx: Context): Promise<Member> {
    return ctx.dataLoader.get('memberForSaleLoader').load(sale.memberId);
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async package(@Root() sale: Sale, @Ctx() ctx: Context): Promise<Package> {
    return ctx.dataLoader.get('packageForSaleLoader').load(sale.packageId);
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async statisticsSales(@Root() sale: Sale, @Ctx() ctx: Context): Promise<StatisticsSale[]> {
    return ctx.dataLoader.get('statisticsSalesForSaleLoader').load(sale.id);
  }

  @Authorized([UserRole.Admin])
  @FieldResolver({ nullable: 'itemsAndList' })
  async paymentConfirm(@Root() sale: Sale, @Ctx() ctx: Context): Promise<PFile[]> {
    return ctx.dataLoader.get('filesForSaleLoader').load(sale.id);
  }
}
