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
import { IDInput, SuccessResponse, SuccessResult } from '@/graphql/common.type';
import {
  CreatePackageInput,
  PackageQueryArgs,
  PackageResponse,
  UpdatePackageInput,
} from './package.type';
import { Package } from './package.entity';
import { Sale } from '../sale/sale.entity';
import { PackageService } from './package.service';

@Service()
@Resolver(() => Package)
export class PackageResolver {
  constructor(private readonly service: PackageService) {}

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

  @Authorized([UserRole.Admin])
  @Mutation(() => Package)
  async createPackage(@Arg('data') data: CreatePackageInput): Promise<Package> {
    return this.service.createPackage(data);
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => Package)
  async updatePackage(@Arg('data') data: UpdatePackageInput): Promise<Package> {
    return this.service.updatePackage(data);
  }

  @Authorized([UserRole.Admin])
  @Mutation(() => SuccessResponse)
  async removePackage(@Arg('data') data: IDInput): Promise<SuccessResponse> {
    await this.service.removePackage(data);
    return {
      result: SuccessResult.success,
    };
  }

  @Authorized([UserRole.Admin])
  @Transaction()
  @Mutation(() => Package)
  async makePrimaryFreeShare(@Arg('data') data: IDInput): Promise<Package> {
    return this.service.makePrimaryFreeShare(data);
  }

  @FieldResolver({ nullable: 'itemsAndList' })
  async sales(@Root() pkg: Package, @Ctx() ctx: Context): Promise<Sale[]> {
    return ctx.dataLoader.get('salesForPackageLoader').load(pkg.id);
  }
}
