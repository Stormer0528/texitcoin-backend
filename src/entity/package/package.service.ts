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
    if (data.freePeriodFrom >= data.freePeriodTo) {
      throw new Error('Period is at lead 1 day');
    }

    const pkg = await this.prisma.package.create({
      data,
    });
    await this.checkIntersectionAndPeriod();
    return pkg;
  }

  async updatePackage(data: UpdatePackageInput) {
    if (data.freePeriodFrom >= data.freePeriodTo) {
      throw new Error('Period is at lead 1 day');
    }

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
    await this.checkIntersectionAndPeriod();
    return pkg;
  }

  private async checkIntersectionAndPeriod() {
    // check intersection
    const res = await this.prisma.$queryRaw<any[]>`
      SELECT pkg1."productName" as "productName1", pkg2."productName" as "productName2"
      FROM packages pkg1
      JOIN packages pkg2
        ON pkg1."freePeriodFrom" < pkg2."freePeriodTo"
        AND pkg1."freePeriodTo" > pkg2."freePeriodFrom"
      WHERE pkg1.id < pkg2.id
        AND pkg1."isFreeShare" IS TRUE
        AND pkg2."isFreeShare" IS TRUE
        AND pkg1.status IS TRUE
        AND pkg2.status IS TRUE
        AND pkg1."freePeriodFrom" IS NOT null
        AND pkg1."freePeriodTo" IS NOT null
        AND pkg2."freePeriodFrom" IS NOT null
        AND pkg2."freePeriodTo" IS NOT null
    `;
    if (res.length) {
      throw new Error(
        `Period intersection exists - ${res.map((pkg) => `(${pkg.productName1}, ${pkg.productName2})`).join(',')}`
      );
    }
    const resPeriod = await this.prisma.$queryRaw<any[]>`
      SELECT "productName"
      FROM packages
      WHERE "freePeriodFrom" >= "freePeriodTo"
        AND "isFreeShare" IS TRUE
        AND "status" IS TRUE 
        AND "freePeriodFrom" IS NOT null
        AND "freePeriodTo" IS NOT null
    `;
    if (resPeriod.length) {
      throw new Error(
        `Some products have no period - ${resPeriod.map((pkg) => pkg.productName).join(',')}`
      );
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
