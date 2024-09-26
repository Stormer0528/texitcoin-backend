import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import { CreatePackageInput, PackageQueryArgs, UpdatePackageInput } from './package.type';

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
    return this.prisma.package.create({
      data,
    });
  }

  async updatePackage(data: UpdatePackageInput) {
    const sale = await this.prisma.sale.findFirst({
      where: {
        packageId: data.id,
      },
    });

    const updateData = sale
      ? {
          productName: data.productName,
          freePeriodFrom: data.freePeriodFrom,
          freePeriodTo: data.freePeriodTo,
        }
      : data;
    return this.prisma.package.update({
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
