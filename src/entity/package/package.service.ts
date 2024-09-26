import { Service, Inject } from 'typedi';

import { PrismaService } from '@/service/prisma';

import { IDInput } from '@/graphql/common.type';
import { CreatePackageInput, PackageQueryArgs, UpdatePackageInput } from './package.type';
import { Package } from '@prisma/client';

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
    const pkg = await this.prisma.package.create({
      data,
    });
    await this.checkIntersection();
    return pkg;
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
    const pkg = await this.prisma.package.update({
      where: {
        id: data.id,
      },
      data: updateData,
    });
    await this.checkIntersection();
    return pkg;
  }

  private async checkIntersection() {
    // check intersection
    const res = await this.prisma.$queryRaw<Package[]>`
      SELECT pkg1."productName", pkg2."productName"
      FROM packages pkg1
      JOIN packages pkg2
        ON pkg1.from < pkg2.to
        AND pkg1.to > pkg2.from
      WHERE pkg1.id <> pkg2.id
        AND pkg1.isFreeShare IS TRUE
        AND pkg2.isFreeShare IS TRUE
    `;
    if (res.length) {
      throw new Error('Period intersection exists ');
    }
  }

  async removePackage(data: IDInput) {
    return this.prisma.package.delete({
      where: {
        id: data.id,
      },
    });
  }
}
