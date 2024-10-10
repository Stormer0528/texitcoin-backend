import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import { CreatePackageInput, PackageQueryArgs, UpdatePackageInput } from './package.type';
import { FREE_SHARE_ID_1, FREE_SHARE_ID_2 } from '@/consts';

@Service()
export class PackageService {
  constructor(
    @Inject(() => PrismaService)
    private readonly prisma: PrismaService
  ) {}
  async getPackages(params: PackageQueryArgs) {
    return await this.prisma.package.findMany({
      where: params.where,
      orderBy: params.orderBy,
      ...params.parsePage,
    });
  }

  async getPackagesCount(params: PackageQueryArgs): Promise<number> {
    return this.prisma.package.count({ where: params.where });
  }

  async getPackageById(id: string) {
    return this.prisma.package.findUnique({
      where: {
        id,
      },
    });
  }

  async createPackage(data: CreatePackageInput) {
    return await this.prisma.package.create({
      data,
    });
  }

  async updatePackage(data: UpdatePackageInput) {
    if (data.id === FREE_SHARE_ID_1 || data.id === FREE_SHARE_ID_2) {
      throw new Error('Can not edit this product.');
    }
    const sale = await this.prisma.sale.findFirst({
      where: {
        packageId: data.id,
      },
    });

    const updateData = sale
      ? {
          productName: data.productName,
        }
      : data;
    return await this.prisma.package.update({
      where: {
        id: data.id,
      },
      data: updateData,
    });
  }

  async removePackage(data: IDInput) {
    return this.prisma.package.delete({
      where: {
        id: data.id,
      },
    });
  }
}
