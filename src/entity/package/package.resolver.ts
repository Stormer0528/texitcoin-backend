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
import {
  CreatePackageInput,
  PackageQueryArgs,
  PackageResponse,
  UpdatePackageInput,
} from './package.type';
import { Package } from './package.entity';
import { Sale } from '../sale/sale.entity';
import { PackageService } from './package.service';
import { SuccessResult } from '@/graphql/enum';
import { PaymentMethodLinkService } from '../paymentMethodLink/paymentMethodLink.service';
import { PaymentMethodLink } from '../paymentMethodLink/paymentMethodLink.entity';

@Service()
@Resolver(() => Package)
export class PackageResolver {
  constructor(
    private readonly service: PackageService,
    private readonly paymentMethodLinkService: PaymentMethodLinkService
  ) {}

  @Query(() => PackageResponse)
  async packages(
    @Args() query: PackageQueryArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<PackageResponse> {
    const { where, ...rest } = query;
    const fields = graphqlFields(info);

    let promises: { total?: Promise<number>; packages?: any } = {};

    if ('total' in fields) {
      promises.total = this.service.getPackagesCount(query);
    }

    if ('packages' in fields) {
      promises.packages = this.service.getPackages(query);
    }

    const result = await Promise.all(Object.entries(promises));

    let response: { total?: number; packages?: Package[] } = {};

    for (let [key, value] of result) {
      response[key] = value;
    }

    return response;
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => Package)
  async createPackage(@Arg('data') data: CreatePackageInput): Promise<Package> {
    return this.service.createPackage(data);
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => Package)
  async updatePackage(@Arg('data') data: UpdatePackageInput): Promise<Package> {
    return this.service.updatePackage(data);
  }

  @Authorized([UserRole.ADMIN])
  @Transaction()
  @Mutation(() => SuccessResponse)
  async removePackage(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    await this.paymentMethodLinkService.removePaymentMethodLinksByPaymentMethodId(data.id);
    await this.service.removePackage(data);
    return {
      result: SuccessResult.success,
    };
  }

  @FieldResolver({ nullable: true })
  async sales(@Root() pkg: Package, @Ctx() ctx: Context): Promise<Sale[]> {
    return ctx.dataLoader.get('salesForPackageLoader').load(pkg.id);
  }
  @FieldResolver({ nullable: true })
  async paymentMethodLinks(
    @Root() pkg: Package,
    @Ctx() ctx: Context
  ): Promise<PaymentMethodLink[]> {
    return ctx.dataLoader.get('paymentMethodLinksForPackageLoader').load(pkg.id);
  }
}
